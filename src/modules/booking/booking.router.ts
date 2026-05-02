import express from 'express';
import authenticate from '../../middlewares/authenticate';
import requireAdmin from '../../middlewares/requireAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { createBookingZodSchema, listMyBookingsZodSchema } from './booking.zod';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validateRequest(createBookingZodSchema),
  BookingController.createBooking,
);

router.get('/', authenticate, validateRequest(listMyBookingsZodSchema), BookingController.listMine);

const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', BookingController.listAdmin);

export const BookingRoutes = router;
export const AdminBookingRoutes = adminRouter;
