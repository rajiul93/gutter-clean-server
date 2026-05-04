import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
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

export const CallBookingController = {
  lookup,
  list,
  getOne,
  create,
  patch,
};
