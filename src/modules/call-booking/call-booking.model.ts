import { Schema, model } from 'mongoose';
import type { ICallBooking } from './call-booking.interface';

const callBookingSchema = new Schema<ICallBooking>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneNormalized: { type: String, required: true, index: true, unique: true },
    linkedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking', sparse: true, index: true },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    serviceId: {
      type: String,
      enum: ['gutter', 'roof', 'downpipe', 'inspect'],
      required: true,
    },
    preferredDateISO: { type: String, trim: true },
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
