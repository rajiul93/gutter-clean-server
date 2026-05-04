import express from 'express';
import authenticate from '../../middlewares/authenticate';
import requireAdmin from '../../middlewares/requireAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { CallBookingController } from './call-booking.controller';
import {
  createCallBookingZodSchema,
  createSiteBookingFromLeadZodSchema,
  getCallBookingByIdZodSchema,
  listCallBookingQueryZodSchema,
  lookupCallBookingZodSchema,
  patchCallBookingZodSchema,
} from './call-booking.zod';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get(
  '/lookup',
  validateRequest(lookupCallBookingZodSchema),
  CallBookingController.lookup,
);
router.get('/', validateRequest(listCallBookingQueryZodSchema), CallBookingController.list);
router.post(
  '/:id/site-booking',
  validateRequest(createSiteBookingFromLeadZodSchema),
  CallBookingController.createSiteBooking,
);
router.get('/:id', validateRequest(getCallBookingByIdZodSchema), CallBookingController.getOne);
router.post('/', validateRequest(createCallBookingZodSchema), CallBookingController.create);
router.patch('/:id', validateRequest(patchCallBookingZodSchema), CallBookingController.patch);

export const CallBookingRoutes = router;
