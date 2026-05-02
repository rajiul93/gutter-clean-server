import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as BookingService from '../booking/booking.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const getByDate = catchAsync(async (req: Request, res: Response) => {
  const raw = req.params.dateISO;
  const dateISO = Array.isArray(raw) ? raw[0] : raw;
  if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid dateISO; expected YYYY-MM-DD',
      data: null,
    });
  }
  const data = await BookingService.getAvailabilityForDate(dateISO);
  return sendResponse(res, httpStatus.OK, 'Availability retrieved', data);
});

export const AvailabilityController = { getByDate };
