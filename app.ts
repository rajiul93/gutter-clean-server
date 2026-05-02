import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './src/config';
import AppError from './src/errors/AppError';
import globalErrorHandler from './src/middlewares/globalErrorHandler';
import { AuthRoutes } from './src/modules/auth/auth.router';
import { AddressRoutes } from './src/modules/address/address.router';
import { AvailabilityRoutes } from './src/modules/availability/availability.router';
import { AdminBookingRoutes, BookingRoutes } from './src/modules/booking/booking.router';

const app = express();

const corsOrigins = config.cors_origin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : ['http://localhost:3000'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Gutter API');
});

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/bookings', BookingRoutes);
app.use('/api/v1/admin/bookings', AdminBookingRoutes);
app.use('/api/v1/availability', AvailabilityRoutes);
app.use('/api/v1/me/address', AddressRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

export default app;
