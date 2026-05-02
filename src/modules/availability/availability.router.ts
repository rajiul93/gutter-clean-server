import express from 'express';
import { AvailabilityController } from './availability.controller';

const router = express.Router();

router.get('/:dateISO', AvailabilityController.getByDate);

export const AvailabilityRoutes = router;
