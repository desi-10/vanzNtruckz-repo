import { prisma } from "@/lib/db";
import { ParcelSchema } from "@/types/parcel";
import { checkAuth } from "@/utils/check-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parcel = await prisma.parcel.findMany();

    return NextResponse.json(
      { message: "Parcel fetched successfully", data: parcel },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching parcel:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
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
        name,
      },
    });

    if (parcel) {
      return NextResponse.json(
        { error: "Parcel already exists" },
        { status: 400 }
      );
    }

    const newParcel = await prisma.parcel.create({
      data: {
        name,
        description,
        isActive,
      },
    });

    console.log(newParcel, "newParcel");

    return NextResponse.json(
      { message: "Parcel created successfully", data: newParcel },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error creating parcel:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
