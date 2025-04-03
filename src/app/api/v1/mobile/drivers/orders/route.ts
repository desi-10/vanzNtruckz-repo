import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const userId = validateJWT(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        vehicle: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        driverId: driver.userId,
      },
      orderBy: {
        createdAt: "desc",
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
            isActive: true,
          },
        },
        bids: {
          where: {
            driverId: driver.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        coupon: {
          select: {
            id: true,
            discount: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Orders fetched successfully",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching driver orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
