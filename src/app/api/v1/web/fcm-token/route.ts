import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const FCMTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = FCMTokenSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { token } = validatedData.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(user, "user");

    console.log(token, "token");

    await prisma.user.update({
      where: { id: session.user.id },
      data: { fcmToken: token },
    });

    return NextResponse.json(
      { message: "Token sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
