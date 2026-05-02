import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as AddressService from './address.service';

const getMine = catchAsync(async (req: Request, res: Response) => {
  const userId = req.appUser!.id;
  const data = await AddressService.getAddressForUser(userId);
  return sendResponse(res, httpStatus.OK, 'Address retrieved', data);
});

const putMine = catchAsync(async (req: Request, res: Response) => {
  const userId = req.appUser!.id;
  const data = await AddressService.upsertAddressForUser(userId, req.body);
  return sendResponse(res, httpStatus.OK, 'Address saved', data);
});

export const AddressController = { getMine, putMine };
