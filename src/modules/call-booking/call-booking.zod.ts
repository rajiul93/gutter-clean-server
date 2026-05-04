import { z } from 'zod';

const serviceIdZ = z.enum(['gutter', 'roof', 'downpipe', 'inspect']);
const preferredSlotZ = z.enum(['morning', 'afternoon', 'evening', 'flexible']);

const mongoIdParam = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
});

const dateISOZ = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use date YYYY-MM-DD');

/** Real `Booking` slots (no "flexible"). */
const siteBookingSlotZ = z.enum(['morning', 'afternoon', 'evening']);

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
      preferredDateISO: dateISOZ,
      preferredSlot: preferredSlotZ,
      address: z.string().min(3, 'Address is required'),
      notes: z.string().optional(),
      customerEmail: z.string().email().optional(),
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
      preferredDateISO: dateISOZ.optional(),
      preferredSlot: preferredSlotZ.optional(),
      address: z.string().min(3).optional(),
      notes: z.union([z.string(), z.null()]).optional(),
      customerEmail: z.union([z.string().email(), z.null()]).optional(),
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

export const createSiteBookingFromLeadZodSchema = z.object({
  body: z
    .object({
      customerUserId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
      email: z.string().email().optional(),
      dateISO: dateISOZ.optional(),
      slot: siteBookingSlotZ,
      serviceId: serviceIdZ.optional(),
      featureIds: z.array(z.string()).optional(),
      size: z.enum(['small', 'medium', 'large']),
      name: z.string().min(1).max(200).optional(),
      phone: z.string().min(5).max(40).optional(),
      location: z.string().min(3).max(2000).optional(),
    })
    .strict(),
  query: z.object({}).strict(),
  params: mongoIdParam,
});
