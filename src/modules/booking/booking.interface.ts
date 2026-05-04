import type { JobSize, ServiceId } from '../../lib/booking-pricing';
import type { SlotPeriod } from '../../lib/slot-capacity';
import { Types } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IBooking {
  /** Set when the customer has a linked site User; omit for pure phone-admin bookings. */
  userId?: Types.ObjectId;
  dateISO: string;
  slot: SlotPeriod;
  serviceId: ServiceId;
  featureIds: string[];
  size: JobSize;
  name: string;
  email: string;
  phone: string;
  location: string;
  total: number;
  status: BookingStatus;
}
