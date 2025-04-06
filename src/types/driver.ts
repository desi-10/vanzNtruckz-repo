import { Driver, User } from "@prisma/client";
import { z } from "zod";
import { OrderType } from "./order";
import { vechicleType } from "./vehicle";

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

export const UpdateDriverSchema = z.object({
  name: z.string().nullish(),
  address: z.string().nullish(),
  phoneNumber: z.string().length(10, "Invalid phone number").nullish(),
  kycStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).nullish(),
  profilePicture: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  carPicture: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  vehicleId: z.string().nullish(),
  numberPlate: z.string().nullish(),
  numberPlatePicture: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  license: z.string().nullish(),
  licensePicture: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  licenseExpiry: z.string().nullish(),
  roadworthyNumber: z.string().nullish(),
  roadworthySticker: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  roadworthyExpiry: z.string().nullish(),
  insuranceSticker: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
  insurance: z.string().nullish(),
  insuranceExpiry: z.string().nullish(),
  ghanaCard: z.string().nullish(),
  ghanaCardPicture: z.union([
    z.string().base64().nullish(),
    z.instanceof(File).nullish(),
  ]),
});

export type UserDriverType = User & {
  image: { id: string; url: string } | null;
  orders: OrderType[];
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

export type DriverType = Driver & {
  carPicture: { id: string; url: string } | null;
  profilePicture: { id: string; url: string } | null;
  licensePicture: { id: string; url: string } | null;
  numberPlatePicture: { id: string; url: string } | null;
  ghanaCardPicture: { id: string; url: string } | null;
  roadworthySticker: { id: string; url: string } | null;
  insuranceSticker: { id: string; url: string } | null;
  vehicle: vechicleType;
  orders: OrderType[];
  user: User;
};
