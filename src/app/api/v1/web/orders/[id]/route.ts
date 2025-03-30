import { prisma } from "@/lib/db";
import { OrderSchema } from "@/types/order";
import { checkAuth } from "@/utils/check-auth";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          select: {
            parcelId: true,
            pieces: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Orders fetched successfully", data: order },
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
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          select: {
            parcelId: true,
            pieces: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.formData();

    const parsedData = OrderSchema.safeParse({
      pickUpPoint: body.get("pickUpPoint") as string,
      dropOffPoint: body.get("dropOffPoint") as string,
      vehicleId: body.get("vehicleId") as string,
      parcel: body.get("parcel") as string,
      image: body.get("imageOne") as string,
      imageTwo: body.get("imageTwo") as string,
      imageThree: body.get("imageThree") as string,
      recepientName: body.get("recepientName") as string,
      recepientNumber: body.get("recepientNumber") as string,
      additionalInfo: body.get("additionalInfo") as string,
      baseCharge: body.get("baseCharge") as string,
      coupon: body.get("coupon") as string,
      status: body.get("status") as string,
    });

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: parsedData.error.format() },
        { status: 400 }
      );
    }

    const {
      pickUpPoint,
      dropOffPoint,
      vehicleId,
      parcel,
      imageOne,
      imageTwo,
      imageThree,
      recepientName,
      recepientNumber,
      additionalInfo,

      coupon,
      status,
    } = parsedData.data;

    if (order.status !== "PENDING" && status === "CANCELED") {
      return NextResponse.json({}, { status: 400 });
    }

    let uploadResult = null;
    let uploadResultTwo = null;
    let uploadResultThree = null;

    if (imageOne) {
      if (
        order.imageOne &&
        typeof order.imageOne === "object" &&
        "id" in order.imageOne
      ) {
        await deleteFile(order.imageOne.id as string);
      }
      uploadResult = await uploadFile("orders", imageOne as File);
    }

    if (imageTwo) {
      if (
        order.imageTwo &&
        typeof order.imageTwo === "object" &&
        "id" in order.imageTwo
      ) {
        await deleteFile(order.imageTwo.id as string);
      }
      uploadResultTwo = await uploadFile("orders", imageTwo as File);
    }

    if (imageThree) {
      if (
        order.imageThree &&
        typeof order.imageThree === "object" &&
        "id" in order.imageThree
      ) {
        await deleteFile(order.imageThree.id as string);
      }
      uploadResultThree = await uploadFile("orders", imageThree as File);
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        pickUpPoint: pickUpPoint || order.pickUpPoint || "",
        dropOffPoint: dropOffPoint || order.dropOffPoint || "",
        vehicleId: vehicleId || order.vehicleId || "",
        items: {
          update:
            parcel?.map((item) => ({
              where: { id: item.parcelId },
              data: { pieces: item.pieces },
            })) || order.items,
        },
        recepientName: recepientName || order.recepientName || "",
        recepientNumber: recepientNumber || order.recepientNumber || "",
        additionalInfo: additionalInfo || order.additionalInfo || null,
        couponId: coupon || order.couponId || null,
        status: status || order.status || "PENDING",
        imageOne: uploadResult || order.imageOne || undefined,
        imageTwo: uploadResultTwo || order.imageTwo || undefined,
        imageThree: uploadResultThree || order.imageThree || undefined,
      },
    });

    return NextResponse.json(
      { message: "Order updated successfully", data: updatedOrder },
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
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "" }, { status: 400 });
    }

    await prisma.order.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Order deleted successfully", data: order },
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
