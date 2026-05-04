import type { Types } from 'mongoose';

export type CallBookingServiceId = 'gutter' | 'roof' | 'downpipe' | 'inspect';

export type CallBookingPreferredSlot = 'morning' | 'afternoon' | 'evening' | 'flexible';

export interface ICallBooking {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  phoneNormalized: string;
  /** Last site `Booking` created from this intake (repeat callers update this pointer; history stays under admin Online bookings). */
  linkedBookingId?: Types.ObjectId;
  /** Customer’s registered/login email — used to link bookings to their account when possible. */
  customerEmail?: string;
  serviceId: CallBookingServiceId;
  /** Visit date captured on the call (YYYY-MM-DD). Older records may omit this. */
  preferredDateISO?: string;
  preferredSlot: CallBookingPreferredSlot;
  address: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
