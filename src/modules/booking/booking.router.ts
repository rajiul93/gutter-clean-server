import express from 'express';
import authenticate from '../../middlewares/authenticate';
import requireAdmin from '../../middlewares/requireAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { createBookingZodSchema, patchAdminBookingStatusZodSchema } from './booking.zod';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validateRequest(createBookingZodSchema),
  BookingController.createBooking,
);

router.get('/', authenticate, BookingController.listMine);

const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', BookingController.listAdmin);
adminRouter.patch(
  '/:id/status',
  validateRequest(patchAdminBookingStatusZodSchema),
  BookingController.patchAdminStatus,
);

export const BookingRoutes = router;
export const AdminBookingRoutes = adminRouter;
