import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const orderId = (await params).id;
    const userId = validateJWT(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get driver with their vehicle type
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        vehicle: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Get order with related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        driverId: driver.userId,
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            Parcel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
          },
        },
        bids: {
          where: {
            driverId: driver.userId,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Order fetched successfully",
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching driver order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
