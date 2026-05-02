import { z } from 'zod';

const slotEnum = z.enum(['morning', 'afternoon', 'evening']);
const sizeEnum = z.enum(['small', 'medium', 'large']);
const serviceEnum = z.enum(['gutter', 'roof', 'downpipe', 'inspect']);

const adminBookingStatusEnum = z.enum([
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
]);

export const patchAdminBookingStatusZodSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: adminBookingStatusEnum,
  }),
});

export const createBookingZodSchema = z.object({
  body: z.object({
    dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateISO must be YYYY-MM-DD'),
    slot: slotEnum,
    serviceId: serviceEnum,
    featureIds: z.array(z.string()).default([]),
    size: sizeEnum,
    name: z.string().min(2).max(200),
    email: z.email(),
    phone: z.string().min(7).max(40),
    location: z.string().min(8).max(2000),
  }),
});
