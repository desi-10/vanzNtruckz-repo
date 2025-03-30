import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid"; // Import for auto-generating coupon codes

export const GET = async () => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { message: "Coupons fetched successfully", data: coupons },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const couponSchema = z.object({
  code: z.string().min(3).max(255).optional(), // Now optional for auto-generation
  isDefault: z.boolean().optional(),
  expiry: z.string().datetime(), // ISO 8601 format, e.g., 2023-09-15T12:00:00Z
  discount: z.number().min(0).max(100), // Percentage discount, e.g., 10 for 10% off
});

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validate = couponSchema.safeParse(body);

    if (!validate.success) {
      return NextResponse.json(
        {
          error: "Invalid fields",
          errors: validate.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    let { code } = validate.data;
    const { isDefault, discount, expiry } = validate.data;

    // Ensure expiry date is in the future
    if (new Date(expiry) <= new Date()) {
      return NextResponse.json(
        { error: "Expiry date must be in the future" },
        { status: 400 }
      );
    }

    // Auto-generate a unique coupon code if none is provided
    if (!code) {
      code = `COUPON-${nanoid(8).toUpperCase()}`;
    }

    const couponExists = await prisma.coupon.findUnique({
      where: { code },
    });

    if (couponExists) {
      return NextResponse.json(
        { error: "Coupon already exists" },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.coupon.updateMany({ data: { isDefault: false } });
    }

    const coupon = await prisma.coupon.create({
      data: { code, discount, isDefault, expiry },
    });

    return NextResponse.json(
      { message: "Coupon created successfully", data: coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
