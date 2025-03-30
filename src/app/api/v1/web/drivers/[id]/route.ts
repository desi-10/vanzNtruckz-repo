import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;

    const session = await auth();
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        driverProfile: true,
        address: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User retrieved successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const updateDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  email: z.string().optional(),
  address: z.string().min(2, "Address must be at least 2 characters").nullish(),
  vehicleId: z.string().optional(),
  numberPlate: z.string().optional(),
  roadworthyNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  roadworthyExpiry: z.string().optional(),
  kycStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  profilePicture: z.instanceof(File).optional().nullable(),
  carPicture: z.instanceof(File).optional().nullable(),
  numberPlatePicture: z.instanceof(File).optional().nullable(),
  license: z.string().optional().nullable(),
  licensePicture: z.instanceof(File).optional().nullable(),
  roadworthySticker: z.instanceof(File).optional().nullable(),
  insuranceSticker: z.instanceof(File).optional().nullable(),
  insurance: z.string().optional().nullable(),
  ghanaCard: z.string().optional().nullable(),
  ghanaCardPicture: z.instanceof(File).optional().nullable(),
});

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;
    const session = await auth();

    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const body: Record<string, File | string | null> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    const validate = updateDriverSchema.safeParse(body);
    if (!validate.success) {
      return NextResponse.json(
        { error: "Invalid data format", issues: validate.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      email,
      address,
      profilePicture,
      carPicture,
      vehicleId,
      numberPlate,
      roadworthyNumber,
      licenseExpiry,
      insuranceExpiry,
      roadworthyExpiry,
      kycStatus,
      licensePicture,
      license,
      roadworthySticker,
      insuranceSticker,
      insurance,
      ghanaCard,
      ghanaCardPicture,
      numberPlatePicture,
    } = validate.data;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { driverProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upload Files if Available
    let profilePictureUpload = null;
    let carPictureUpload = null;
    let licensePictureUpload = null;
    let numberPlatePictureUpload = null;
    let roadworthyStickerUpload = null;
    let insuranceStickerUpload = null;
    let ghanaCardPictureUpload = null;

    if (profilePicture) {
      profilePictureUpload = await uploadFile("profile", profilePicture);
    }

    if (carPicture) {
      carPictureUpload = await uploadFile("car", carPicture);
    }

    if (licensePicture) {
      licensePictureUpload = await uploadFile("license", licensePicture);
    }

    if (numberPlatePicture) {
      numberPlatePictureUpload = await uploadFile(
        "number_plate",
        numberPlatePicture
      );
    }

    if (roadworthySticker) {
      roadworthyStickerUpload = await uploadFile(
        "roadworthy",
        roadworthySticker
      );
    }

    if (insuranceSticker) {
      insuranceStickerUpload = await uploadFile("insurance", insuranceSticker);
    }

    if (ghanaCardPicture) {
      ghanaCardPictureUpload = await uploadFile("ghana_card", ghanaCardPicture);
    }

    // Update User & Driver Profile
    await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        address,
        driverProfile: {
          upsert: {
            create: {
              profilePicture:
                profilePictureUpload?.url ||
                user.driverProfile?.profilePicture ||
                {},
              carPicture:
                carPictureUpload?.url || user.driverProfile?.carPicture || {},
              insurance: insurance || user.driverProfile?.insurance || null,
              ghanaCard: ghanaCard || user.driverProfile?.ghanaCard || null,
              license: license || user.driverProfile?.license || null,
              vehicleId: vehicleId || null,
              numberPlate: numberPlate || null,
              roadworthyNumber: roadworthyNumber || null,
              licenseExpiry: licenseExpiry || null,
              insuranceExpiry: insuranceExpiry || null,
              roadworthyExpiry: roadworthyExpiry || null,
              kycStatus: kycStatus || "PENDING",
              licensePicture:
                licensePictureUpload?.url ||
                user.driverProfile?.licensePicture ||
                {},
              numberPlatePicture:
                numberPlatePictureUpload?.url ||
                user.driverProfile?.numberPlatePicture ||
                {},
              roadworthySticker:
                roadworthyStickerUpload?.url ||
                user.driverProfile?.roadworthySticker ||
                {},
              insuranceSticker:
                insuranceStickerUpload?.url ||
                user.driverProfile?.insuranceSticker ||
                {},
              ghanaCardPicture:
                ghanaCardPictureUpload?.url ||
                user.driverProfile?.ghanaCardPicture ||
                {},
            },
            update: {
              profilePicture:
                profilePictureUpload?.url ||
                user.driverProfile?.profilePicture ||
                {},
              carPicture:
                carPictureUpload?.url || user.driverProfile?.carPicture || {},
              insurance: insurance || user.driverProfile?.insurance || null,
              ghanaCard: ghanaCard || user.driverProfile?.ghanaCard || null,
              license: license || user.driverProfile?.license || null,
              vehicleId: vehicleId || user.driverProfile?.vehicleId || null,
              numberPlate:
                numberPlate || user.driverProfile?.numberPlate || null,
              roadworthyNumber:
                roadworthyNumber ||
                user.driverProfile?.roadworthyNumber ||
                null,
              licenseExpiry:
                licenseExpiry || user.driverProfile?.licenseExpiry || null,
              insuranceExpiry:
                insuranceExpiry || user.driverProfile?.insuranceExpiry || null,
              roadworthyExpiry:
                roadworthyExpiry ||
                user.driverProfile?.roadworthyExpiry ||
                null,
              kycStatus:
                kycStatus || user.driverProfile?.kycStatus || "PENDING",
              licensePicture:
                licensePictureUpload?.url ||
                user.driverProfile?.licensePicture ||
                {},
              numberPlatePicture:
                numberPlatePictureUpload?.url ||
                user.driverProfile?.numberPlatePicture ||
                {},
              roadworthySticker:
                roadworthyStickerUpload?.url ||
                user.driverProfile?.roadworthySticker ||
                {},
              insuranceSticker:
                insuranceStickerUpload?.url ||
                user.driverProfile?.insuranceSticker ||
                {},
              ghanaCardPicture:
                ghanaCardPictureUpload?.url ||
                user.driverProfile?.ghanaCardPicture ||
                {},
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Driver updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating driver:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) => {
  try {
    const id = (await params).id;
    const session = await auth();
    if (
      !session ||
      !(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Driver deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
