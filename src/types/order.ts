import { z } from "zod";

const orderItems = z.object({
  parcelId: z.string().min(1),
  pieces: z.coerce.number().min(1),
});

export const OrderSchema = z.object({
  pickUpPoint: z.string().min(1, "Pick up address is required"),
  dropOffPoint: z.string().min(1, "Drop off address is required"),
  vehicleId: z.string().min(1, "Vehicle type is required"),
  parcel: z.array(orderItems),
  imageOne: z.union([
    z.instanceof(File).optional().nullable(),
    z.string().base64().optional().nullable(),
  ]),
  imageTwo: z.union([
    z.instanceof(File).optional().nullable(),
    z.string().base64().optional().nullable(),
  ]),
  imageThree: z.union([
    z.instanceof(File).optional().nullable(),
    z.string().base64().optional().nullable(),
  ]),
  recepientName: z.string().min(1, "Recipient name is required"),
  recepientNumber: z.string().min(1, "Recipient number is required"),
  additionalInfo: z.string().optional().nullable(),
  coupon: z.string().optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELED"])
    .default("PENDING")
    .optional(),
  scheduledDate: z.date().nullish(),
  isScheduled: z.boolean().default(false).nullish(),
});
