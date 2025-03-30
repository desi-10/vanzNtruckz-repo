import { prisma } from "@/lib/db";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "Vehicles fetched successfully", data: vehicles },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
