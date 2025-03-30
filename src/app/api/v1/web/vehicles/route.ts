import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { VehicleSchema } from "@/types/vehicle";
import { uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { message: "Vehicles fetched successfully", data: vehicles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.formData();
    const parsedData = VehicleSchema.safeParse({
      name: body.get("name"),
      type: body.get("type"),
      weight: Number(body.get("weight")),
      isActive: body.get("isActive") === "true",
      image: body.get("image"),
    });

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { name, weight, isActive, image } = parsedData.data;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { name },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle with this name already exists" },
        { status: 409 }
      );
    }

    let uploadResult = null;

    if (image) {
      uploadResult = await uploadFile("vehicles", image as File);
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        name,
        weight,
        isActive,
        image: uploadResult || undefined,
      },
    });

    return NextResponse.json(
      { message: "Vehicle added successfully", data: newVehicle },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
