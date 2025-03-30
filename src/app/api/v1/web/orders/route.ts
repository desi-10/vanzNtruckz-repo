import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { OrderSchema } from "@/types/order";
import { checkAuth } from "@/utils/check-auth";
import { uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        driver: {
          select: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log("", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.formData();

    const parsedData = OrderSchema.safeParse({
      pickUpPoint: body.get("pickUpPoint") as string,
      dropOffPoint: body.get("dropOffPoint") as string,
      vehicleId: body.get("vehicleId") as string,
      parcelType: body.get("parcelType") as string,
      pieces: body.get("pieces") as string,
      image: body.get("imageOne") as string,
      imageTwo: body.get("imageTwo") as string,
      recepientName: body.get("recepientName") as string,
      recepientNumber: body.get("recepientNumber") as string,
      additionalInfo: body.get("additionalInfo") as string,
      baseCharge: body.get("baseCharge") as string,
      coupon: body.get("coupon") as string,
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
      coupon,
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
          customerId: session.user.id!,
          pickUpPoint,
          dropOffPoint,
          vehicleId: vehicleId,
          parcelId,
          pieces,
          imageOne: uploadResult || undefined,
          imageTwo: uploadResultTwo || undefined,
          recepientName,
          recepientNumber,
          additionalInfo,
          couponId: coupon || null,
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
          userId: session.user.id!,
          orderId: newOrder.id,
          type: "ORDER",
          isRead: false,
          message: `Your order has been placed successfully`,
        },
      });

      return newOrder;
    });

    console.log(result, "result");

    return NextResponse.json(
      { message: "Order created successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.log("", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
