import { z } from 'zod';

export const upsertAddressZodSchema = z.object({
  body: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(3).max(20),
    country: z.string().min(2).max(100).optional(),
  }),
  query: z.record(z.string(), z.unknown()),
  params: z.record(z.string(), z.unknown()),
});
