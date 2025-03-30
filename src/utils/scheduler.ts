import notificationQueue from "@/config/queue";

export async function scheduleNotification({
  orderId,
  fmcToken,
}: {
  orderId: string;
  fmcToken: string;
}) {
  await notificationQueue.add(
    "notifyAdmin",
    { orderId, fmcToken },
    { delay: 5 * 1000 } // Delay for 1 minute
    // { delay: 5 * 60 * 1000 } // Delay for 5 minutes
  );
}
