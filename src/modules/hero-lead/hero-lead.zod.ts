import { z } from 'zod';

const mongoIdParam = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
});

export const createHeroLeadPublicZodSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(200),
      phone: z.string().min(5, 'Phone is required').max(40),
      location: z.string().min(3, 'Location is required').max(2000),
    })
    .strict(),
  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const listHeroLeadAdminQueryZodSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
  params: z.object({}).strict(),
});

export const patchHeroLeadCallbackZodSchema = z.object({
  body: z
    .object({
      callback: z.boolean(),
    })
    .strict(),
  query: z.object({}).strict(),
  params: mongoIdParam,
});
