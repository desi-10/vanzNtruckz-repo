import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

// Initialize Redis connection with Vercel Redis
const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Create Notification Queue
export const notificationQueue = new Queue("orderNotifications", {
  connection: redisConnection,
});

// Worker to process delayed jobs
const worker = new Worker(
  "orderNotifications",
  async (job: Job) => {
    try {
      const { orderId } = job.data;
      console.log(`Processing notification for Order Id: ${orderId}`);

      // Create the notification payload

      // await sendAdminNotification(message);
      console.log(`✅ Notification sent for Order ID: ${orderId}`);
    } catch (error) {
      // console.error(`❌ Failed to send notification: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

// Event Listeners
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

export default notificationQueue;
