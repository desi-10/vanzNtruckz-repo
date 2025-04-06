import { User } from "@prisma/client";
import { OrderType } from "./order";

export type CustomerType = User & {
  image: { id: string; url: string } | null;
  orders: OrderType[];
};
