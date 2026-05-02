import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as BookingService from './booking.service';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.appUser!.id;
  const result = await BookingService.createBooking({
    userId,
    ...req.body,
  });
  return sendResponse(res, httpStatus.CREATED, 'Booking created', result);
});

const listMine = catchAsync(async (req: Request, res: Response) => {
  const userId = req.appUser!.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await BookingService.listBookingsForUser(userId, page, limit);
  return sendResponse(res, httpStatus.OK, 'Bookings retrieved', result);
});

const listAdmin = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const dateFrom =
    typeof req.query.dateFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.dateFrom)
      ? req.query.dateFrom
      : undefined;
  const dateTo =
    typeof req.query.dateTo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.dateTo)
      ? req.query.dateTo
      : undefined;
  const result = await BookingService.listAllBookingsAdmin({ page, limit, dateFrom, dateTo });
  return sendResponse(res, httpStatus.OK, 'Bookings retrieved', result);
});

export const BookingController = {
  createBooking,
  listMine,
  listAdmin,
};
