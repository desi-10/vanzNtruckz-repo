import { Driver, User } from "@prisma/client";
import { z } from "zod";

export const addUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  identifier: z.string().min(1, "Identifier is required").max(255),
  address: z.string().max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255),
  role: z
    .enum(["DRIVER", "CUSTOMER", "ADMIN", "SUPER_ADMIN"])
    .default("CUSTOMER"),
  image: z.instanceof(File).optional().nullable(),
});

export type DriverType = User & {
  image: { id: string; url: string } | null;
  driverProfile:
    | null
    | (Driver & {
        carPicture: { id: string; url: string } | null;
        profilePicture: { id: string; url: string } | null;
        licensePicture: { id: string; url: string } | null;
        numberPlatePicture: { id: string; url: string } | null;
        ghanaCardPicture: { id: string; url: string } | null;
        roadworthySticker: { id: string; url: string } | null;
        insuranceSticker: { id: string; url: string } | null;
      });
};
