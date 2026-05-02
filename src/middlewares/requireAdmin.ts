import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';

const requireAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.appUser?.role !== 'ADMIN') {
    throw new AppError('Admin access required', httpStatus.FORBIDDEN);
  }
  next();
});

export default requireAdmin;
