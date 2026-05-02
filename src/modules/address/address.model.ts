import { Schema, model } from 'mongoose';
import { IAddress } from './address.interface';

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'USA', trim: true },
  },
  { timestamps: true },
);

export const Address = model<IAddress>('Address', addressSchema);
