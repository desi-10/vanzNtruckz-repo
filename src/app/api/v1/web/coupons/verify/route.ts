import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

const couponSchema = z.object({
  id: z.string().min(1, "Coupon ID is required"),
});

export const POST = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = couponSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: parsedData.error.format() },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (coupon.isActive === false || coupon.expiry < new Date()) {
      return NextResponse.json({ error: "Coupon expired" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Coupon verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying coupon:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
