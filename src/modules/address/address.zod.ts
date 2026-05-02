import { z } from 'zod';

export const upsertAddressZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(120),
    email: z.string().min(3).max(200).email('Valid email is required'),
    phone: z.string().min(3, 'Phone is required').max(40),
    location: z.string().min(1, 'Location is required').max(500),
  }),
});
