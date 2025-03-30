import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { uploadFile } from "@/utils/cloudinary";
import { addUserSchema } from "@/types/driver";
import { checkAuth } from "@/utils/check-auth";

export const GET = async (req: Request) => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const customers = await prisma.user.findMany({
      take: limit,
      skip,
      where: {
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const totalCustomers = customers.length;

    return NextResponse.json({
      message: "Customers fetched successfully",
      data: customers,
      pagination: { page, totalPages: Math.ceil(totalCustomers / limit) },
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
    const session = await checkAuth();
    if (!session) {
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

      return { newUser };
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
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
