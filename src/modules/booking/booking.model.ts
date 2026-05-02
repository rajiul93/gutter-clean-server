import { Schema, model } from 'mongoose';
import { IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateISO: { type: String, required: true, index: true },
    slot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    serviceId: {
      type: String,
      enum: ['gutter', 'roof', 'downpipe', 'inspect'],
      required: true,
    },
    featureIds: [{ type: String }],
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

bookingSchema.index({ dateISO: 1, slot: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
