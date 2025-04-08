import { noBidNotificationQueue, notificationQueue } from "@/config/queue";

export async function orderCreatedNotification({
  message,
}: {
  message: string;
}) {
  await notificationQueue.add("order-created", { message });
}
export async function scheduleBidNotification({
  orderId,
  message,
}: {
  orderId: string;
  message: string;
}) {
  await noBidNotificationQueue.add(
    "no-bids",
    { orderId, message },
    { delay: 60 * 1000 } // Delay for 1 minute
    // { delay: 5 * 60 * 1000 } // Delay for 5 minutes
  );
}
