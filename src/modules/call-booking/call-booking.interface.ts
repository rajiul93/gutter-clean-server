import type { Types } from 'mongoose';

export type CallBookingServiceId = 'gutter' | 'roof' | 'downpipe' | 'inspect';

export type CallBookingPreferredSlot = 'morning' | 'afternoon' | 'evening' | 'flexible';

export interface ICallBooking {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  phoneNormalized: string;
  serviceId: CallBookingServiceId;
  preferredSlot: CallBookingPreferredSlot;
  address: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
