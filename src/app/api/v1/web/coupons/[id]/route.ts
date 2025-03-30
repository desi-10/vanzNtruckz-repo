import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Coupon fetched successfully", data: coupon },
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

const updateCouponShema = z.object({
  isDefault: z.boolean(),
  expiry: z.string().datetime(), // Assuming expiry is a string in ISO format
  discount: z.number().min(0).max(100),
});

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validate = updateCouponShema.safeParse(body);

    if (!validate.success) {
      return NextResponse.json(
        { error: validate.error.errors[0].message },
        { status: 400 }
      );
    }

    const { isDefault, expiry, discount } = validate.data;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        discount,
        isDefault,
        expiry: new Date(expiry),
      },
    });
    return NextResponse.json(
      { message: "Coupon updated successfully", data: updatedCoupon },
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

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Coupon deleted successfully" },
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
