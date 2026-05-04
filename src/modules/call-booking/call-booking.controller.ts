import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import type { ServiceId } from '../../lib/booking-pricing';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { User } from '../user/user.model';
import * as BookingService from '../booking/booking.service';
import * as CallBookingService from './call-booking.service';

function paramId(req: Request): string {
  const raw = req.params.id;
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw != null ? String(raw) : '';
}

const lookup = catchAsync(async (req: Request, res: Response) => {
  const phone = typeof req.query.phone === 'string' ? req.query.phone : '';
  const doc = await CallBookingService.findCallBookingByPhone(phone);
  return sendResponse(
    res,
    httpStatus.OK,
    doc ? 'Found' : 'Not found',
    doc ? CallBookingService.toPublicRow(doc) : null,
  );
});

const list = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const [items, total] = await Promise.all([
    CallBookingService.listCallBookings(page, limit),
    CallBookingService.countCallBookings(),
  ]);
  const rows = items.map((d) => CallBookingService.toPublicRow(d));
  return sendResponse(res, httpStatus.OK, 'Call bookings retrieved', {
    items: rows,
    total,
    page,
    limit,
  });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const id = paramId(req);
  const doc = await CallBookingService.getCallBookingById(id);
  return sendResponse(res, httpStatus.OK, 'Call booking retrieved', CallBookingService.toPublicRow(doc));
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CallBookingService.createCallBooking(req.body);
  if (result.conflict) {
    return sendResponse(res, httpStatus.CONFLICT, 'A record for this phone already exists', {
      existingId: result.existingId,
    });
  }
  return sendResponse(
    res,
    httpStatus.CREATED,
    'Call booking created',
    CallBookingService.toPublicRow(result.doc),
  );
});

const patch = catchAsync(async (req: Request, res: Response) => {
  const id = paramId(req);
  const updated = await CallBookingService.updateCallBooking(id, req.body);
  return sendResponse(res, httpStatus.OK, 'Call booking updated', CallBookingService.toPublicRow(updated));
});

const createSiteBooking = catchAsync(async (req: Request, res: Response) => {
  const id = paramId(req);
  const body = req.body as {
    customerUserId?: string;
    email?: string;
    dateISO?: string;
    slot: 'morning' | 'afternoon' | 'evening';
    serviceId?: ServiceId;
    featureIds?: string[];
    size: 'small' | 'medium' | 'large';
    name?: string;
    phone?: string;
    location?: string;
  };

  const lead = await CallBookingService.getCallBookingById(id);

  const dateISO = (body.dateISO ?? lead.preferredDateISO)?.trim();
  if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    throw new AppError(
      'Pick a valid visit date (YYYY-MM-DD) on the intake lead or send dateISO.',
      httpStatus.BAD_REQUEST,
    );
  }

  const serviceId = (body.serviceId ?? lead.serviceId) as ServiceId;

  const mongoIdCandidate = body.customerUserId?.trim();
  let linkedUserId: string | undefined;
  let bookingEmail = '';

  if (mongoIdCandidate && Types.ObjectId.isValid(mongoIdCandidate)) {
    const accountById = await User.findById(mongoIdCandidate).select('email').lean();
    if (!accountById) {
      throw new AppError('Customer user id not found', httpStatus.NOT_FOUND);
    }
    linkedUserId = String(accountById._id);
    bookingEmail = accountById.email;
  } else {
    const raw =
      body.email?.trim().toLowerCase() ||
      lead.customerEmail?.trim().toLowerCase() ||
      '';
    if (raw) {
      const accountByEmail = await User.findOne({ email: raw }).select('email').lean();
      if (accountByEmail) {
        linkedUserId = String(accountByEmail._id);
        bookingEmail = accountByEmail.email;
      } else {
        bookingEmail = raw;
      }
    } else {
      const digits = CallBookingService.normalizePhone(body.phone ?? lead.phone);
      bookingEmail = `phone-${digits || 'guest'}@phone-intake.invalid`;
    }
  }

  const createdPlain = await BookingService.createBooking({
    ...(linkedUserId ? { userId: linkedUserId } : {}),
    dateISO,
    slot: body.slot,
    serviceId,
    featureIds: body.featureIds ?? [],
    size: body.size,
    name: (body.name?.trim() || lead.name).trim(),
    email: bookingEmail,
    phone: (body.phone?.trim() || lead.phone).trim(),
    location: (body.location?.trim() || lead.address).trim(),
  });

  const bookingIdStr = String((createdPlain as { _id: { toString(): string } })._id);

  const persistOnLeadEmail = bookingEmail.endsWith('@phone-intake.invalid')
    ? undefined
    : bookingEmail;
  await CallBookingService.attachBookingToLead(id, bookingIdStr, persistOnLeadEmail);

  const freshLead = await CallBookingService.getCallBookingById(id);

  return sendResponse(res, httpStatus.CREATED, 'Dashboard booking created from phone intake', {
    lead: CallBookingService.toPublicRow(freshLead),
    booking: {
      _id: bookingIdStr,
      dateISO: createdPlain.dateISO,
      slot: createdPlain.slot,
      serviceId: createdPlain.serviceId,
      total: createdPlain.total,
      status: createdPlain.status,
      userId: linkedUserId ?? null,
    },
  });
});

export const CallBookingController = {
  lookup,
  list,
  getOne,
  create,
  patch,
  createSiteBooking,
};
