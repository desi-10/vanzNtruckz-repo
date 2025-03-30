import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parcel = await prisma.parcel.findMany({
      where: {
        isActive: true,
      },
    });

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
