import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateCustomerSchema = z.object({
  email: z.string().email().nullish(),
  phone: z.string().min(10).max(10).nullish(),
  name: z.string().min(2).max(50).nullish(),
  address: z.string().min(2).max(50).nullish(),
  image: z.instanceof(File).nullish(),
});

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (!session) {
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
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
            driver: {
              select: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
            vehicle: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer retrieved successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse form data
    const body = await request.formData();
    const updateFields: Record<string, string | File | null> = {};

    // Validate only provided fields
    if (body.has("email")) updateFields.email = body.get("email") as string;
    if (body.has("name")) updateFields.name = body.get("name") as string;
    if (body.has("phone")) updateFields.phone = body.get("phone") as string;
    if (body.has("address"))
      updateFields.address = body.get("address") as string;
    if (body.has("image"))
      updateFields.image = body.get("image") as File | string | null;

    // Validate user input
    const validatedData = UpdateCustomerSchema.safeParse(updateFields);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { email, phone, name, address, image } = validatedData.data;

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
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
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

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Customer deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
