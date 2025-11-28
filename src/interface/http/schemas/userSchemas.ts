import { z } from 'zod';

export const upgradePlanSchema = z.object({
  planCode: z.string().min(1),
});

export const downgradePlanSchema = z.object({
  planCode: z.string().min(1),
});

