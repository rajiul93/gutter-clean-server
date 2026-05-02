import express from 'express';
import authenticate from '../../middlewares/authenticate';
import validateRequest from '../../middlewares/validateRequest';
import { AddressController } from './address.controller';
import { upsertAddressZodSchema } from './address.zod';

const router = express.Router();

router.use(authenticate);

router.get('/', AddressController.getMine);
router.put('/', validateRequest(upsertAddressZodSchema), AddressController.putMine);

export const AddressRoutes = router;
