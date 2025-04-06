import { Order } from "@prisma/client";
import { z } from "zod";
import { userType } from "./user";
import { DriverType } from "./driver";
import { vechicleType } from "./vehicle";

const orderItems = z.object({
  parcelId: z.string().min(1),
  pieces: z.coerce.number().min(1),
});

export const OrderSchema = z.object({
  pickUpPoint: z.string().min(1, "Pick up address is required"),
  dropOffPoint: z.string().min(1, "Drop off address is required"),
  driverId: z.string().nullish(),
  vehicleId: z.string().min(1, "Vehicle type is required"),
  amount: z.coerce.number().nullish(),
  parcel: z.array(orderItems),
  imageOne: z.union([
    z.instanceof(File).nullish(),
    z.string().base64().nullish(),
  ]),
  imageTwo: z.union([
    z.instanceof(File).nullish(),
    z.string().base64().nullish(),
  ]),
  imageThree: z.union([
    z.instanceof(File).nullish(),
    z.string().base64().nullish(),
  ]),
  recepientName: z.string().min(1, "Recipient name is required"),
  recepientNumber: z.string().min(1, "Recipient number is required"),
  additionalInfo: z.string().nullish(),
  coupon: z.string().nullish(),
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELED"])
    .default("PENDING")
    .optional(),
  scheduledDate: z.string().datetime().nullish(),
});

export type OrderItem = {
  id: string;
  parcelId: string;
  pieces: number;
  Parcel: {
    name: string;
    unit: string;
  };
};

export type OrderType = Order & {
  customer?: userType;
  driver?: DriverType;
  vehicle: vechicleType;
  amount: number;
  items?: OrderItem[];
  status: Order["status"];
  imageOne?: { id: string; url: string } | null;
  imageTwo?: { id: string; url: string } | null;
  imageThree?: { id: string; url: string } | null;
  scheduledDate: Date | null;
  coupon: string | null;
  createdAt: string;
  updatedAt: string;
};
