import { z } from "zod";

export const OrderSchema = z.object({
  pickUpPoint: z.string().min(1, "Pick up address is required"),
  dropOffPoint: z.string().min(1, "Drop off address is required"),
  vehicleId: z.string().min(1, "Vehicle type is required"),
  parcelId: z.string().min(1, "Parcel type is required"),
  pieces: z.coerce.number().min(1, "Pieces is required"),
  imageOne: z.union([
    z.instanceof(File).optional().nullable(),
    z.string().base64().optional().nullable(),
  ]),
  imageTwo: z.union([
    z.instanceof(File).optional().nullable(),
    z.string().base64().optional().nullable(),
  ]),
  recepientName: z.string().min(1, "Recipient name is required"),
  recepientNumber: z.string().min(1, "Recipient number is required"),
  additionalInfo: z.string().optional().nullable(),
  baseCharge: z.string().min(1, "Base charge is required"),
  coupon: z.string().optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELED"])
    .default("PENDING")
    .optional(),
});
