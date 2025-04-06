import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { addUserSchema } from "@/types/driver";
import { uploadFile } from "@/utils/cloudinary";
import bcrypt from "bcryptjs";

import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const drivers = await prisma.driver.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        vehicle: true,
        orders: true,
      },
    });

    const totalDrivers = await prisma.driver.count();

    return NextResponse.json({
      message: "Drivers fetched successfully",
      data: drivers,
      pagination: { page, totalPages: Math.ceil(totalDrivers / limit) },
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.formData();

    // Validate input
    const validation = addUserSchema.safeParse({
      identifier: body.get("identifier"),
      name: body.get("name"),
      address: body.get("address"),
      role: body.get("role"),
      password: body.get("password"),
      image: body.get("image"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    const { identifier, password, name, role, address } = validation.data;
    const sanitizedIdentifier = identifier.trim().toLowerCase();

    let isEmail = false;
    let user = null;

    // Identify email or phone
    if (/^\S+@\S+\.\S+$/.test(sanitizedIdentifier)) {
      isEmail = true;
      user = await prisma.user.findUnique({
        where: { email: sanitizedIdentifier },
      });
    } else if (/^\d{10,15}$/.test(sanitizedIdentifier)) {
      user = await prisma.user.findUnique({
        where: { phone: sanitizedIdentifier },
      });
    } else {
      return NextResponse.json(
        { error: "Please enter a valid email or phone number" },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (user) {
      return NextResponse.json(
        { error: `${isEmail ? "Email" : "Phone number"} already exists` },
        { status: 409 }
      );
    }

    let uploadResult = null;
    if (validation.data.image) {
      uploadResult = await uploadFile("profile", validation.data.image);
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          password: hashedPassword,
          role: role,
          address: address,
          image: uploadResult || {},
          ...(isEmail
            ? { emailVerified: new Date() }
            : { phoneVerified: new Date() }),
          ...(isEmail
            ? { email: sanitizedIdentifier }
            : { phone: sanitizedIdentifier }),
        },
      });

      let newDriver = null;
      if (newUser.role === "DRIVER") {
        newDriver = await tx.driver.create({
          data: {
            userId: newUser.id,
            vehicleId: null,
          },
        });
      }
      return { newUser, ...(newUser.role === "DRIVER" ? newDriver : {}) };
    });

    return NextResponse.json(
      {
        message: "Driver registered successfully.",
        user: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
