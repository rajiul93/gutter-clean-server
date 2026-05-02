import type { UserRole } from '../modules/user/user.interface';

export type AppUserPayload = {
  id: string;
  firebaseUid: string;
  email: string;
  role: UserRole;
  displayName?: string;
};

declare global {
  namespace Express {
    interface Request {
      appUser?: AppUserPayload;
    }
  }
}

export {};
