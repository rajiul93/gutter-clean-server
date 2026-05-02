import { z } from 'zod';

const slotEnum = z.enum(['morning', 'afternoon', 'evening']);
const sizeEnum = z.enum(['small', 'medium', 'large']);
const serviceEnum = z.enum(['gutter', 'roof', 'downpipe', 'inspect']);

export const createBookingZodSchema = z.object({
  body: z.object({
    dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slot: slotEnum,
    serviceId: serviceEnum,
    featureIds: z.array(z.string()),
    size: sizeEnum,
    name: z.string().min(2).max(200),
    email: z.string().email(),
    phone: z.string().min(7).max(40),
    location: z.string().min(8).max(2000),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listMyBookingsZodSchema = z.object({
  body: z.record(z.string(), z.unknown()),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
  params: z.record(z.string(), z.unknown()),
});
