import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import AppError from '../errors/AppError';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { User } from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

/**
 * Verifies Firebase ID token and attaches `req.appUser` (upserts Mongo user).
 */
const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authorization Bearer token required', httpStatus.UNAUTHORIZED);
  }
  const idToken = header.slice(7).trim();
  if (!idToken) {
    throw new AppError('Authorization Bearer token required', httpStatus.UNAUTHORIZED);
  }

  const adminSdk = getFirebaseAdmin();
  const decoded = await adminSdk.auth().verifyIdToken(idToken);
  const email = decoded.email;
  if (!email) {
    throw new AppError('Your account must have an email address', httpStatus.BAD_REQUEST);
  }

  const firebaseUid = decoded.uid;
  const displayName = decoded.name ?? undefined;
  const photoURL = (decoded as { picture?: string }).picture ?? undefined;
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = config.admin_emails.includes(normalizedEmail);

  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await User.create({
      firebaseUid,
      email: normalizedEmail,
      displayName,
      photoURL,
      role: isAdminEmail ? 'ADMIN' : 'USER',
    });
  } else {
    user.email = normalizedEmail;
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    if (isAdminEmail && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
    }
    await user.save();
  }

  req.appUser = {
    id: user._id.toString(),
    firebaseUid: user.firebaseUid,
    email: user.email,
    role: user.role,
    displayName: user.displayName ?? undefined,
  };
  next();
});

export default authenticate;
