import { prisma } from "@/lib/db";
import { checkAuth } from "@/utils/check-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parcel = await prisma.parcel.findUnique({
      where: {
        id: id,
      },
    });

    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Parcel fetched successfully", data: parcel },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch parcel", error: error },
      { status: 500 }
    );
  }
};

const ParcelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
  isActive: z.boolean().default(true),
});

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = ParcelSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { name, description, isActive } = parsedData.data;

    const parcel = await prisma.parcel.findUnique({
      where: {
        id: id,
      },
    });

    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    const newParcel = await prisma.parcel.update({
      where: {
        id: id,
      },
      data: {
        name,
        description,
        isActive,
      },
    });

    return NextResponse.json(
      { message: "Parcel updated successfully", data: newParcel },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update parcel", error: error },
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
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parcel = await prisma.parcel.findUnique({
      where: {
        id: id,
      },
    });
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    await prisma.parcel.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      {
        message: "Parcel deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting parcel:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
