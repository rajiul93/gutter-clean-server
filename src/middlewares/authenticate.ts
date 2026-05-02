import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import AppError from '../errors/AppError';
import { verifyFirebaseIdToken } from '../lib/verify-firebase-id-token';
import { User } from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

/**
 * Verifies Firebase ID token (JWKS, no Admin SDK) and attaches `req.appUser` (upserts Mongo user).
 */
const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const projectId = config.firebase_project_id?.trim();
  if (!projectId) {
    throw new AppError(
      'Set FIREBASE_PROJECT_ID to your Firebase project ID (same value as NEXT_PUBLIC_FIREBASE_PROJECT_ID on the web app).',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authorization Bearer token required', httpStatus.UNAUTHORIZED);
  }
  const idToken = header.slice(7).trim();
  if (!idToken) {
    throw new AppError('Authorization Bearer token required', httpStatus.UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken, projectId);
  } catch {
    throw new AppError('Invalid or expired session. Please sign in again.', httpStatus.UNAUTHORIZED);
  }

  const email = decoded.email;
  if (!email) {
    throw new AppError('Your account must have an email address', httpStatus.BAD_REQUEST);
  }

  const firebaseUid = decoded.uid;
  const displayName = decoded.name ?? undefined;
  const photoURL = decoded.picture ?? undefined;
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = config.admin_emails.includes(normalizedEmail);

  const $set: Record<string, unknown> = { email: normalizedEmail };
  if (displayName) $set.displayName = displayName;
  if (photoURL) $set.photoURL = photoURL;
  if (isAdminEmail) $set.role = 'ADMIN';

  const $setOnInsert: Record<string, unknown> = {
    firebaseUid,
    email: normalizedEmail,
    role: isAdminEmail ? 'ADMIN' : 'USER',
  };
  if (displayName !== undefined) $setOnInsert.displayName = displayName;
  if (photoURL !== undefined) $setOnInsert.photoURL = photoURL;

  const user = await User.findOneAndUpdate(
    { firebaseUid },
    { $set, $setOnInsert },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  if (!user) {
    throw new AppError('Could not load user profile', httpStatus.INTERNAL_SERVER_ERROR);
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
