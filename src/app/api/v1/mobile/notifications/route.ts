import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateJWT } from "@/utils/jwt";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get total count
    const totalNotifications = await prisma.inbox.count({
      where: { userId: user.id },
    });

    // Get paginated notifications
    const notifications = await prisma.inbox.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            pickUpPoint: true,
            dropOffPoint: true,
            status: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalNotifications / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        message: "Notifications fetched successfully",
        data: notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalNotifications,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: Request) => {
  try {
    const id = validateJWT(request);
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await prisma.inbox.delete({
      where: { id: notificationId },
    });

    return NextResponse.json(
      {
        message: "Notification deleted successfully",
        data: notification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
