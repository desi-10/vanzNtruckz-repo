import { z } from "zod";

export const PricingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  basePrice: z.number().min(1, "Amount is required"),
});
