import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

const bidSchema = z.object({
  orderId: z.string().min(1),
  amount: z.coerce.number().min(1),
});

export const POST = async (request: Request) => {
  try {
    const id = await validateJWT(request);
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await prisma.user.findUnique({
      where: { id },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (driver.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = bidSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: "" }, { status: 400 });
    }

    const { orderId, amount } = parsedData.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const bid = await prisma.bid.create({
      data: {
        orderId,
        driverId: driver.id,
        amount,
      },
    });

    return NextResponse.json(
      { message: "Bid crreated successfully", data: bid },
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
