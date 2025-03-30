import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { VehicleSchema } from "@/types/vehicle";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();
    if (
      !session ||
      !(
        session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
      include: {
        orders: true,
        drivers: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Vehicles fetched successfully", data: vehicle },
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

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();
    if (
      !session ||
      !(
        session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
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

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { name },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    let uploadResult = null;

    if (image instanceof File) {
      if (
        vehicle.image &&
        typeof vehicle.image === "object" &&
        "id" in vehicle.image
      ) {
        await deleteFile(vehicle.image.id as string);
      }
      uploadResult = await uploadFile("vehicles", image as File);
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        name,
        weight,
        isActive,
        image: uploadResult || undefined,
      },
    });

    return NextResponse.json(
      { message: "Vehicle updated successfully", data: updatedVehicle },
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
      !(
        session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.vehicle.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Vehicle deleted successfully" },
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
