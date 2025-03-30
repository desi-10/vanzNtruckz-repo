import { prisma } from "@/lib/db";
import { z } from "zod";
import { NextResponse } from "next/server";
import { validateJWT } from "@/utils/jwt";
import { uploadFile } from "@/utils/cloudinary";
// import { sendAdminNotification } from "@/config/firebase";
// import { scheduleNotification } from "@/utils/scheduler";

const OrderSchema = z.object({
  pickUpPoint: z.string().min(1, "Pick up address is required"),
  dropOffPoint: z.string().min(1, "Drop off address is required"),
  vehicleId: z.string().min(1, "Vehicle type is required"),
  parcelId: z.string().min(1, "Parcel type is required"),
  pieces: z.coerce.number().min(1, "Pieces is required"),
  imageOne: z.union([z.string().base64(), z.instanceof(File)]).nullish(),
  imageTwo: z.union([z.string().base64(), z.instanceof(File)]).nullish(),
  recepientName: z.string().min(1, "Recipient name is required"),
  recepientNumber: z.string().min(1, "Recipient number is required"),
  additionalInfo: z.string().nullish(),
  couponId: z.string().nullish(),
});

/** ✅ GET - Fetch Paginated Orders */
export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);
    // const id = "cm8s1ygyw0000gdmwdmokbsn8";

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        coupon: true,
        driver: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                name: true,
                phone: true,
                address: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Orders fetched successfully", data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  // const id = validateJWT(request);
  const id = "cm8s1ygyw0000gdmwdmokbsn8";

  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await request.formData();

    const parsedData = OrderSchema.safeParse({
      pickUpPoint: body.get("pickUpPoint") as string,
      dropOffPoint: body.get("dropOffPoint") as string,
      vehicleId: body.get("vehicleId") as string,
      parcelId: body.get("parcelId") as string,
      pieces: body.get("pieces") as string,
      image: body.get("image") as string,
      recepientName: body.get("recepientName") as string,
      recepientNumber: body.get("recepientNumber") as string,
      additionalInfo: body.get("additionalInfo") as string,
      couponId: body.get("couponId") as string,
    });

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: parsedData.error.format() },
        { status: 400 }
      );
    }

    const {
      pickUpPoint,
      dropOffPoint,
      vehicleId,
      parcelId,
      pieces,
      imageOne,
      imageTwo,
      recepientName,
      recepientNumber,
      additionalInfo,
      couponId,
    } = parsedData.data;

    let uploadResult = null;
    let uploadResultTwo = null;

    if (imageOne) {
      uploadResult = await uploadFile("orders", imageOne as string);
    }

    if (imageTwo) {
      uploadResultTwo = await uploadFile("orders", imageTwo as string);
    }

    // Run all database operations in a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: user.id || "",
          pickUpPoint,
          dropOffPoint,
          vehicleId: vehicleId || "",
          parcelId: parcelId || "",
          pieces,
          imageOne: uploadResult || undefined,
          imageTwo: uploadResultTwo || undefined,
          recepientName,
          recepientNumber,
          additionalInfo,
          couponId: couponId || null,
          status: "PENDING",
        },
        include: { customer: { select: { id: true, name: true } } },
      });

      const drivers = await tx.driver.findMany({
        where: {
          vehicleId: vehicleId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      });

      for (const driver of drivers) {
        //create inbox
        await tx.inbox.create({
          data: {
            userId: driver.userId,
            orderId: newOrder.id,
            type: "BID",
            isRead: false,
            message: `You have a new order`,
          },
        });

        //sending sms
        console.log("Send sms to driver", driver);
      }

      //create inbox for customer
      await tx.inbox.create({
        data: {
          userId: user.id,
          orderId: newOrder.id,
          type: "ORDER",
          isRead: false,
          message: `Your order has been placed successfully`,
        },
      });

      //alert back-office if no responds in 5minutes using message broker
      const admins = await tx.user.findMany({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] }, // ✅ Correct way to filter by multiple roles
        },
      });

      for (const admin of admins) {
        //sending sms
        console.log("Send sms to admin", admin);

        // const message = {
        //   topic: "orders",
        //   notification: {
        //     title: "New Order",
        //     body: "Order has been placed",
        //   },
        //   token: admin.fcmToken || "",
        // };

        // await sendAdminNotification(message);
        // await scheduleNotification({
        //   orderId: newOrder.id,
        //   fmcToken: admin.fcmToken || "",
        // });
      }

      return newOrder;
    });

    return NextResponse.json(
      { message: "Order created successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
