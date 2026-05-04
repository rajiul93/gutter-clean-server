import { Schema, model } from 'mongoose';
import type { ICallBooking } from './call-booking.interface';

const callBookingSchema = new Schema<ICallBooking>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneNormalized: { type: String, required: true, index: true, unique: true },
    serviceId: {
      type: String,
      enum: ['gutter', 'roof', 'downpipe', 'inspect'],
      required: true,
    },
    preferredSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible'],
      required: true,
    },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export const CallBooking = model<ICallBooking>('CallBooking', callBookingSchema);
