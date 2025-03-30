import { Vehicle } from "@prisma/client";
import { z } from "zod";

export const VehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  isActive: z.boolean().default(true),
  description: z.string().nullish(),
  image: z.instanceof(File).nullish(),
});

export type vechicleType = Vehicle & {
  image: { url: string; id: string };
};
