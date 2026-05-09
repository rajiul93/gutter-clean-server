import type { Types } from 'mongoose';

export interface IHeroLead {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  location: string;
  /** Whether an admin marked this lead as scheduled for callback. */
  callback: boolean;
  createdAt: Date;
  updatedAt: Date;
}
