import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { KycStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const driverSchemaArray = z.array(
  z.object({
    id: z.string(),
    status: z.string(),
  })
);

export const PATCH = async (request: Request) => {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validate = driverSchemaArray.safeParse(body);
    if (!validate.success) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const driverIds = body.map((driver: { id: string }) => driver.id);

    const updatedDrivers = await prisma.driver.updateMany({
      where: {
        userId: { in: driverIds },
      },
      data: {
        kycStatus: KycStatus.APPROVED,
      },
    });

    return NextResponse.json({
      message: "KYC approved successfully",
      updatedCount: updatedDrivers.count,
    });
  } catch (error) {
    console.error("Error approving KYC:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
