import { prisma } from "@/lib/db";
import axios from "axios";
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

export const noBidNotificationQueue = new Queue("noBidNotification", {
  connection: redisConnection,
});

// Worker to process delayed jobs
const worker = new Worker(
  "orderNotifications",
  async (job: Job) => {
    try {
      const { message } = job.data;

      await axios.post("http://localhost:4000/send-notification", {
        message,
      });

      console.log("Order notification sent");
    } catch (error) {
      // console.error(`❌ Failed to send notification: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

const worker2 = new Worker(
  "noBidNotification",
  async (job: Job) => {
    try {
      const { orderId, message } = job.data;

      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          bids: true,
        },
      });

      if (order?.bids && order?.bids?.length === 1) {
        const admins = await prisma.user.findMany({
          where: {
            role: { in: ["ADMIN", "SUPER_ADMIN"] }, // ✅ Correct way to filter by multiple roles
          },
        });

        for (const admin of admins) {
          await prisma.inbox.create({
            data: {
              userId: admin.id,
              orderId: order.id,
              type: "BID",
              isRead: false,
              message: `No bids were placed for the order ${order.id}`,
            },
          });
        }

        await axios.post("http://localhost:4000/no-bid-notification", {
          message,
        });
      } else {
        // CASE 2: More than 1 bid — calculate average + commission
        const bidAmounts = order?.bids
          ? order?.bids?.map((bid) => bid.amount)
          : [];
        const total = bidAmounts?.reduce((sum, amount) => sum + amount, 0) || 0;
        const averageBid = total / bidAmounts?.length || 0;

        const COMMISSION_RATE = 0.1; // 10%
        const priceWithCommission = averageBid + averageBid * COMMISSION_RATE;

        // Get all drivers (you can refine this if needed)
        const drivers = await prisma.driver.findMany({
          include: {
            user: true, // assuming Driver has a relation to User for email/phone
          },
        });

        for (const driver of drivers) {
          // You can customize this with socket, FCM, SMS, etc.
          await prisma.inbox.create({
            data: {
              userId: driver.userId, // assuming this connects to the User model
              orderId: order?.id,
              type: "BID",
              isRead: false,
              message: `A new job is available. Estimated earning: GHS ${priceWithCommission.toFixed(
                2
              )}`,
            },
          });
        }

        // Optional: Send via socket/HTTP
        await axios.post("http://localhost:4000/new-bid-notification", {
          message: `Average bid: GHS ${averageBid.toFixed(
            2
          )}, after commission: GHS ${priceWithCommission.toFixed(2)}`,
        });
      }

      console.log("No bid notification sent");
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

worker2.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
});

worker2.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
