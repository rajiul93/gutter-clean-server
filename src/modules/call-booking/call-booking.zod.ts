import { z } from 'zod';

const serviceIdZ = z.enum(['gutter', 'roof', 'downpipe', 'inspect']);
const preferredSlotZ = z.enum(['morning', 'afternoon', 'evening', 'flexible']);

const mongoIdParam = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
});

export const lookupCallBookingZodSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    phone: z.string().min(2, 'phone required'),
  }),
  params: z.object({}).strict(),
});

export const createCallBookingZodSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required'),
      phone: z.string().min(5, 'Phone is required'),
      serviceId: serviceIdZ,
      preferredSlot: preferredSlotZ,
      address: z.string().min(3, 'Address is required'),
      notes: z.string().optional(),
    })
    .strict(),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const patchCallBookingZodSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      phone: z.string().min(5).optional(),
      serviceId: serviceIdZ.optional(),
      preferredSlot: preferredSlotZ.optional(),
      address: z.string().min(3).optional(),
      notes: z.union([z.string(), z.null()]).optional(),
    })
    .strict(),
  query: z.object({}).strict(),
  params: mongoIdParam,
});

export const listCallBookingQueryZodSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
  params: z.object({}).strict(),
});

export const getCallBookingByIdZodSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: mongoIdParam,
});
