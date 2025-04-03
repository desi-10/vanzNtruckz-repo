import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const orderId = (await params).id;
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: orderId },
    });

    if (!driver) {
      return NextResponse.json({ error: "" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, driverId: driver.userId },
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
