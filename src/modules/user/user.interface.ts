import { Model, Types } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
}

export interface IUserDoc extends IUser {
  _id: Types.ObjectId;
}

export interface UserModel extends Model<IUser> {}
