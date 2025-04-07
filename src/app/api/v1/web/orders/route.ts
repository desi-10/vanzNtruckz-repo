import { prisma } from "@/lib/db";
import { OrderSchema } from "@/types/order";
import { checkAuth } from "@/utils/check-auth";
import { uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "50"))
    );
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: "insensitive" } } },
        {
          driver: { user: { name: { contains: search, mode: "insensitive" } } },
        },
        { recepientName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const totalOrders = await prisma.order.count({ where });

    // Get paginated orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            Parcel: {
              select: {
                id: true,
                name: true,
                unit: true,
                description: true,
              },
            },
          },
        },
        bids: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                  },
                },
                vehicle: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                    image: true,
                  },
                },
                // rating: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            vehicle: true,
            // rating: true,
          },
        },
        vehicle: true,
        coupon: true,
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json(
      {
        message: "Orders fetched successfully",
        data: orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalOrders,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
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
      parcel: JSON.parse((body.get("parcel") as string) || "[]"),
      image: body.get("imageOne") as string,
      imageTwo: body.get("imageTwo") as string,
      imageThree: body.get("imageThree") as string,
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
      parcel,
      imageOne,
      imageTwo,
      imageThree,
      recepientName,
      recepientNumber,
      additionalInfo,
      coupon,
    } = parsedData.data;

    let uploadResult = null;
    let uploadResultTwo = null;
    let uploadResultThree = null;

    if (imageOne) {
      uploadResult = await uploadFile("orders", imageOne as string);
    }

    if (imageTwo) {
      uploadResultTwo = await uploadFile("orders", imageTwo as string);
    }

    if (imageThree) {
      uploadResultThree = await uploadFile("orders", imageThree as string);
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
          items: {
            create: parcel.map((item) => ({
              parcelId: item.parcelId,
              pieces: item.pieces,
            })),
          },
          imageOne: uploadResult || undefined,
          imageTwo: uploadResultTwo || undefined,
          imageThree: uploadResultThree || undefined,
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
