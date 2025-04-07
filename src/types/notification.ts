import { Inbox } from "@prisma/client";
import { OrderType } from "./order";
import { userType } from "./user";

export type NotificationType = Inbox & {
  id: string;
  isRead: boolean;
  message: string;
  order: OrderType;
  user: userType;
  createdAt: string;
  updatedAt: string;
};
