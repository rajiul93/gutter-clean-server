import { Types } from 'mongoose';

export interface IAddress {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  location: string;
}
