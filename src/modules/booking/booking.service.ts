import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import {
  calculateBookingTotal,
  getService,
  isValidServiceId,
  type JobSize,
  type ServiceId,
} from '../../lib/booking-pricing';
import { SLOT_CAPACITY_PER_PERIOD, type SlotPeriod } from '../../lib/slot-capacity';
import { Booking } from './booking.model';
import type { BookingStatus } from './booking.interface';

async function countActiveSlotBookings(dateISO: string, slot: SlotPeriod): Promise<number> {
  return Booking.countDocuments({
    dateISO,
    slot,
    status: { $ne: 'cancelled' },
  });
}

export async function getAvailabilityForDate(dateISO: string) {
  const [morning, afternoon, evening] = await Promise.all([
    countActiveSlotBookings(dateISO, 'morning'),
    countActiveSlotBookings(dateISO, 'afternoon'),
    countActiveSlotBookings(dateISO, 'evening'),
  ]);
  return {
    morning: Math.max(0, SLOT_CAPACITY_PER_PERIOD - morning),
    afternoon: Math.max(0, SLOT_CAPACITY_PER_PERIOD - afternoon),
    evening: Math.max(0, SLOT_CAPACITY_PER_PERIOD - evening),
  };
}

type CreatePayload = {
  userId: string;
  dateISO: string;
  slot: SlotPeriod;
  serviceId: ServiceId;
  featureIds: string[];
  size: JobSize;
  name: string;
  email: string;
  phone: string;
  location: string;
};

export async function createBooking(payload: CreatePayload) {
  const { dateISO, slot, serviceId, featureIds, size, name, email, phone, location, userId } =
    payload;

  if (!isValidServiceId(serviceId)) {
    throw new AppError('Invalid service', httpStatus.BAD_REQUEST);
  }

  const svc = getService(serviceId);
  const allowed = new Set(svc.features.map((f) => f.id));
  const cleanedFeatures = featureIds.filter((id) => allowed.has(id));
  const total = calculateBookingTotal(serviceId, cleanedFeatures, size);
  if (total <= 0) {
    throw new AppError('Invalid booking total', httpStatus.BAD_REQUEST);
  }

  const booked = await countActiveSlotBookings(dateISO, slot);
  if (booked >= SLOT_CAPACITY_PER_PERIOD) {
    throw new AppError(
      'That time slot is fully booked. Please pick another slot.',
      httpStatus.CONFLICT,
    );
  }

  const doc = await Booking.create({
    userId: new Types.ObjectId(userId),
    dateISO,
    slot,
    serviceId,
    featureIds: cleanedFeatures,
    size,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    location: location.trim(),
    total,
    status: 'pending',
  });

  return doc.toObject();
}

export async function listBookingsForUser(userId: string, page = 1, limit = 20) {
  const oid = new Types.ObjectId(userId);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Booking.find({ userId: oid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments({ userId: oid }),
  ]);
  return { items, total, page, limit };
}

type AdminListOpts = {
  page: number;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
};

export async function listAllBookingsAdmin(opts: AdminListOpts) {
  const { page, limit, dateFrom, dateTo } = opts;
  const filter: Record<string, unknown> = {};
  if (dateFrom || dateTo) {
    filter.dateISO = {};
    if (dateFrom) (filter.dateISO as Record<string, string>).$gte = dateFrom;
    if (dateTo) (filter.dateISO as Record<string, string>).$lte = dateTo;
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('userId', 'email displayName')
      .sort({ dateISO: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);
  return { items, total, page, limit };
}

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export async function updateAdminBookingStatus(bookingId: string, nextStatus: BookingStatus) {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking id', httpStatus.BAD_REQUEST);
  }
  const doc = await Booking.findById(bookingId).lean();
  if (!doc) {
    throw new AppError('Booking not found', httpStatus.NOT_FOUND);
  }
  const current = doc.status as BookingStatus;
  const allowed = STATUS_TRANSITIONS[current];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Cannot change status from "${current}" to "${nextStatus}".`,
      httpStatus.BAD_REQUEST,
    );
  }
  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: { status: nextStatus } },
    { new: true, runValidators: true },
  )
    .populate('userId', 'email displayName')
    .lean();
  if (!updated) {
    throw new AppError('Booking not found', httpStatus.NOT_FOUND);
  }
  return updated;
}
