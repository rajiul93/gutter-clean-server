import express from 'express';
import authenticate from '../../middlewares/authenticate';
import { AuthController } from './auth.controller';

const router = express.Router();

router.get('/me', authenticate, AuthController.getMe);

export const AuthRoutes = router;
