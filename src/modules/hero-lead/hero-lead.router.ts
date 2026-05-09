import express from 'express';
import authenticate from '../../middlewares/authenticate';
import requireAdmin from '../../middlewares/requireAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { HeroLeadController } from './hero-lead.controller';
import {
  createHeroLeadPublicZodSchema,
  listHeroLeadAdminQueryZodSchema,
  patchHeroLeadCallbackZodSchema,
} from './hero-lead.zod';

/** Public hero quote submissions (homepage form). */
const publicRouter = express.Router();
publicRouter.post('/', validateRequest(createHeroLeadPublicZodSchema), HeroLeadController.createPublic);

/** Admin-only list + callback toggle. */
const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', validateRequest(listHeroLeadAdminQueryZodSchema), HeroLeadController.listAdmin);
adminRouter.patch(
  '/:id/callback',
  validateRequest(patchHeroLeadCallbackZodSchema),
  HeroLeadController.patchCallback,
);

export const HeroLeadPublicRoutes = publicRouter;
export const HeroLeadAdminRoutes = adminRouter;
