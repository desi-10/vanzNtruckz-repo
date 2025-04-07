import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateJWT } from "@/utils/jwt";
import { uploadFile } from "@/utils/cloudinary";
import { OrderSchema } from "@/types/order";
// import { sendAdminNotification } from "@/config/firebase";
// import { scheduleNotification } from "@/utils/scheduler";

/** ✅ GET - Fetch Paginated Orders */

// type Pagination = {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// };

// Update the GET endpoint to include filters
export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);
    // const id = "cm8x1ve5q0002l5037yo6jj2t";
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const customerName = searchParams.get("customerName");
    const driverName = searchParams.get("driverName");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine user role and filter field accordingly
    const roleBasedFilter =
      user.role === "DRIVER" ? { driverId: user.id } : { customerId: user.id };

    // Build where clause with filters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      ...roleBasedFilter,
      ...(status && { status }),
      ...(customerName && {
        customer: {
          name: {
            contains: customerName,
            mode: "insensitive" as const,
          },
        },
      }),
      ...(driverName && {
        driver: {
          user: {
            name: {
              contains: driverName,
              mode: "insensitive" as const,
            },
          },
        },
      }),
    };

    // Get total count with filters
    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    // Get filtered and paginated orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        pickUpPoint: true,
        dropOffPoint: true,
        recepientName: true,
        recepientNumber: true,
        additionalInfo: true,
        scheduleDate: true,
        isScheduled: true,
        status: true,
        coupon: {
          select: {
            id: true,
            discount: true,
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
        imageOne: true,
        imageTwo: true,
        imageThree: true,
        items: {
          select: {
            parcelId: true,
            pieces: true,
            Parcel: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
        ...(user.role === "CUSTOMER"
          ? {
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
                  vehicle: {
                    select: {
                      id: true,
                      name: true,
                      isActive: true,
                      image: true,
                    },
                  },
                },
              },
            }
          : {}),
        ...(user.role === "DRIVER"
          ? {
              customer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                  address: true,
                },
              },
            }
          : {}),
      },
    });

    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        message: "Orders fetched successfully",
        data: orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalOrders,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
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
  const id = validateJWT(request);
  // const id = "cm8x1ve5q0002l5037yo6jj2t";

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
      parcel: JSON.parse((body.get("parcel") as string) || "[]"),
      imageOne: body.get("imageOne") as string,
      imageTwo: body.get("imageTwo") as string,
      imageThree: body.get("imageThree") as string,
      recepientName: body.get("recepientName") as string,
      recepientNumber: body.get("recepientNumber") as string,
      additionalInfo: body.get("additionalInfo") as string,
      coupon: body.get("coupon") as string,
      scheduledDate: body.get("scheduledDate") as string,
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
      scheduledDate,
    } = parsedData.data;

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.isActive === false) {
      return NextResponse.json(
        { error: "Vehicle is not active" },
        { status: 404 }
      );
    }

    for (const item of parcel) {
      const foundParcel = await prisma.parcel.findUnique({
        where: { id: item.parcelId }, // Ensure `id` is unique
      });

      if (!foundParcel) {
        throw new Error(`Parcel with ID ${item.parcelId} not found`);
      }

      console.log(foundParcel);
    }

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
          customerId: user.id || "",
          pickUpPoint,
          dropOffPoint,
          vehicleId: vehicleId || "",
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
          scheduleDate: scheduledDate || null,
          isScheduled: scheduledDate ? true : false,
          status: "PENDING",
        },
        include: {
          customer: { select: { id: true, name: true } },
        },
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

        await tx.inbox.create({
          data: {
            userId: admin.id,
            orderId: newOrder.id,
            type: "ORDER",
            isRead: false,
            message: `Your order has been placed successfully`,
          },
        });

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
