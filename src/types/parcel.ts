import { Parcel } from "@prisma/client";
import { z } from "zod";

export const ParcelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
  isActive: z.boolean().default(true),
});

export type parcelType = Parcel;
