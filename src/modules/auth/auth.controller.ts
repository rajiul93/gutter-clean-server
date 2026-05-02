import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const u = req.appUser!;
  return sendResponse(res, httpStatus.OK, 'User profile retrieved', {
    id: u.id,
    email: u.email,
    displayName: u.displayName ?? null,
    role: u.role,
  });
});

export const AuthController = { getMe };
