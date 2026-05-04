import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import type {
  CallBookingPreferredSlot,
  CallBookingServiceId,
  ICallBooking,
} from './call-booking.interface';
import { CallBooking } from './call-booking.model';

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function listCallBookings(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return CallBooking.find()
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

export function countCallBookings() {
  return CallBooking.countDocuments();
}

export async function getCallBookingById(id: string) {
  const doc = await CallBooking.findById(id).lean();
  if (!doc) {
    throw new AppError('Call booking not found', httpStatus.NOT_FOUND);
  }
  return doc;
}

export async function findCallBookingByPhone(phone: string) {
  const key = normalizePhone(phone);
  if (!key) return null;
  return CallBooking.findOne({ phoneNormalized: key }).lean();
}

type CreateInput = {
  name: string;
  phone: string;
  serviceId: CallBookingServiceId;
  preferredSlot: CallBookingPreferredSlot;
  address: string;
  notes?: string;
};

export async function createCallBooking(input: CreateInput) {
  const phoneNormalized = normalizePhone(input.phone);
  if (!phoneNormalized) {
    throw new AppError('Phone number is required', httpStatus.BAD_REQUEST);
  }
  const exists = await CallBooking.findOne({ phoneNormalized });
  if (exists) {
    return {
      conflict: true as const,
      existingId: exists._id.toString(),
    };
  }
  const doc = await CallBooking.create({
    name: input.name.trim(),
    phone: input.phone.trim(),
    phoneNormalized,
    serviceId: input.serviceId,
    preferredSlot: input.preferredSlot,
    address: input.address.trim(),
    notes: input.notes?.trim() || undefined,
  });
  return { conflict: false as const, doc: doc.toObject() };
}

type PatchInput = Partial<{
  name: string;
  phone: string;
  serviceId: CallBookingServiceId;
  preferredSlot: CallBookingPreferredSlot;
  address: string;
  notes: string | null;
}>;

export async function updateCallBooking(id: string, patch: PatchInput) {
  const existing = await CallBooking.findById(id);
  if (!existing) {
    throw new AppError('Call booking not found', httpStatus.NOT_FOUND);
  }

  const $set: Record<string, unknown> = {};
  if (patch.name !== undefined) $set.name = patch.name.trim();
  if (patch.serviceId !== undefined) $set.serviceId = patch.serviceId;
  if (patch.preferredSlot !== undefined) $set.preferredSlot = patch.preferredSlot;
  if (patch.address !== undefined) $set.address = patch.address.trim();
  if (patch.notes !== undefined) {
    $set.notes = patch.notes === null || patch.notes === '' ? undefined : String(patch.notes).trim();
  }
  if (patch.phone !== undefined) {
    const next = patch.phone.trim();
    const key = normalizePhone(next);
    if (!key) {
      throw new AppError('Invalid phone number', httpStatus.BAD_REQUEST);
    }
    if (key !== existing.phoneNormalized) {
      const taken = await CallBooking.findOne({ phoneNormalized: key, _id: { $ne: id } });
      if (taken) {
        throw new AppError('Another lead already uses this phone number', httpStatus.CONFLICT);
      }
    }
    $set.phone = next;
    $set.phoneNormalized = key;
  }

  if (Object.keys($set).length === 0) {
    return (await CallBooking.findById(id).lean()) as ICallBooking;
  }

  const updated = await CallBooking.findByIdAndUpdate(
    id,
    { $set },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  if (!updated) {
    throw new AppError('Call booking not found', httpStatus.NOT_FOUND);
  }
  return updated;
}

type CallBookingDoc = Pick<
  ICallBooking,
  'name' | 'phone' | 'serviceId' | 'preferredSlot' | 'address' | 'notes' | 'createdAt' | 'updatedAt'
> & { _id: { toString: () => string } };

export function toPublicRow(doc: CallBookingDoc) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    serviceId: doc.serviceId,
    preferredSlot: doc.preferredSlot,
    address: doc.address,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
