import { Types } from 'mongoose';

export interface IAddress {
  userId: Types.ObjectId;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
