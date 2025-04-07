import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { checkAuth } from "@/utils/check-auth";
import { InboxType } from "@prisma/client";

// GET notifications
export const GET = async (request: Request) => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: session.user.id,
      ...(type && { type }),
      ...(isRead !== null && { isRead: isRead === "true" }),
    };

    const [totalNotifications, notifications] = await Promise.all([
      prisma.inbox.count({
        where: {
          userId: whereClause.userId,
          ...(whereClause.type && { type: whereClause.type as InboxType }),
          ...(whereClause.isRead !== undefined && {
            isRead: whereClause.isRead,
          }),
        },
      }),
      prisma.inbox.findMany({
        where: {
          userId: whereClause.userId,
          ...(whereClause.type && { type: whereClause.type as InboxType }),
          ...(whereClause.isRead !== undefined && {
            isRead: whereClause.isRead,
          }),
        },
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
              customer: {
                select: {
                  name: true,
                  phone: true,
                },
              },
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
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalNotifications / limit);

    return NextResponse.json(
      {
        message: "Notifications fetched successfully",
        data: notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalNotifications,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
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

// PATCH notifications (mark as read/unread)
export const PATCH = async (request: Request) => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, isRead = true } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    await prisma.inbox.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: { isRead },
    });

    return NextResponse.json(
      { message: "Notifications updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// DELETE notifications (bulk or all)
export const DELETE = async (request: Request) => {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const idsParam = searchParams.get("ids");

    const ids = idsParam?.split(",").filter(Boolean);

    if (!all && (!ids || ids.length === 0)) {
      return NextResponse.json(
        { error: "No notifications selected" },
        { status: 400 }
      );
    }

    await prisma.inbox.deleteMany({
      where: {
        userId: session.user.id,
        ...(all ? {} : { id: { in: ids } }),
      },
    });

    return NextResponse.json(
      { message: "Notifications deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
