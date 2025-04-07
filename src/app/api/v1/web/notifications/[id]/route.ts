import { prisma } from "@/lib/db";
import { checkAuth } from "@/utils/check-auth";
import { NextResponse } from "next/server";

export const PATCH = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;

    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification with its ID
    const notification = await prisma.inbox.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.inbox.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "" }, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
