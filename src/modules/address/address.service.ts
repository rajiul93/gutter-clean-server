import { Types } from 'mongoose';
import { Address } from './address.model';

export async function getAddressForUser(userId: string) {
  const doc = await Address.findOne({ userId: new Types.ObjectId(userId) }).lean();
  return doc;
}

export async function upsertAddressForUser(
  userId: string,
  payload: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  },
) {
  const oid = new Types.ObjectId(userId);
  const doc = await Address.findOneAndUpdate(
    { userId: oid },
    {
      $set: {
        line1: payload.line1.trim(),
        line2: payload.line2?.trim(),
        city: payload.city.trim(),
        state: payload.state.trim(),
        postalCode: payload.postalCode.trim(),
        country: (payload.country ?? 'USA').trim(),
      },
      $setOnInsert: { userId: oid },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return doc;
}
