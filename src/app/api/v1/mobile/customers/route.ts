import { prisma } from "@/lib/db";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        address: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Customer retrieved successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Customer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const updateCustomerSchema = z.object({
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  name: z.string().nullish(),
  address: z.string().nullish(),
  image: z.string().base64().nullish(),
});

export const PATCH = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const validate = updateCustomerSchema.safeParse(body);
    if (!validate.success) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const { email, phone, name, address, image } = validate.data;

    let imageUploadResult = null;

    // Handle image upload if present
    if (image) {
      // Delete old image if exists
      if (user.image && typeof user.image === "object" && "id" in user.image) {
        await deleteFile(user.image.id as string);
      }

      // Upload new image
      imageUploadResult = await uploadFile("profile", image);
    }

    // Update user in database with only provided fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email || user.email,
        phone: phone || user.phone,
        name: name || user.name,
        address: address || user.address,
        image: imageUploadResult || user.image || {},
      },
    });

    return NextResponse.json(
      {
        message: "Customer updated successfully",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          address: updatedUser.address,
          image: updatedUser.image,
          emailVerified: updatedUser.emailVerified,
          phoneVerified: updatedUser.phoneVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("PATCH error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
