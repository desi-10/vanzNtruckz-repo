import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);
    if (!id) {
      return NextResponse.json({ error: "" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: id },
    });

    if (!driver) {
      return NextResponse.json({ error: "" }, { status: 404 });
    }

    const order = await prisma.order.findMany({
      where: { driverId: driver.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            Parcel: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "" }, { status: 404 });
    }

    return NextResponse.json({ message: "", data: order }, { status: 200 });
  } catch (error) {
    console.log("", error);
    return NextResponse.json({ error: "" }, { status: 500 });
  }
};
