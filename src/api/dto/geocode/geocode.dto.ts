import { z } from "zod";

export const geocodeSuggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export const geocodeReverseQuerySchema = z.object({
  lng: z.coerce.number().gte(-180).lte(180),
  lat: z.coerce.number().gte(-90).lte(90),
});
