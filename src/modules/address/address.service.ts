import { Types } from 'mongoose';
import { Address } from './address.model';

export async function getAddressForUser(userId: string) {
  const doc = await Address.findOne({ userId: new Types.ObjectId(userId) }).lean();
  return doc;
}

export async function upsertAddressForUser(
  userId: string,
  payload: {
    name: string;
    email: string;
    phone: string;
    location: string;
  },
) {
  const oid = new Types.ObjectId(userId);
  const doc = await Address.findOneAndUpdate(
    { userId: oid },
    {
      $set: {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        location: payload.location.trim(),
      },
      $setOnInsert: { userId: oid },
    },
    {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).lean();
  return doc;
}
