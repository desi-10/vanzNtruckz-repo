import { prisma } from "@/lib/db";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { validateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (request: Request) => {
  try {
    const id = validateJWT(request);

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
        address: true,
        driverProfile: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Driver retrieved successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Driver:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const UpdateDriverSchema = z.object({
  name: z.string().nullish(),
  address: z.string().nullish(),
  phoneNumber: z.string().length(10, "Invalid phone number").nullish(),
  profilePicture: z.string().base64().nullish(),
  carPicture: z.string().base64().nullish(),
  vehicleId: z.string().nullish(),
  numberPlate: z.string().nullish(),
  numberPlatePicture: z.string().base64().nullish(),
  license: z.string().nullish(),
  licensePicture: z.string().base64().nullish(),
  licenseExpiry: z.string().nullish(),
  roadworthyNumber: z.string().nullish(),
  roadworthySticker: z.string().base64().nullish(),
  roadworthyExpiry: z.string().nullish(),
  insuranceSticker: z.string().base64().nullish(),
  insurance: z.string().nullish(),
  insuranceExpiry: z.string().nullish(),
  ghanaCard: z.string().nullish(),
  ghanaCardPicture: z.string().base64().nullish(),
});

export const PATCH = async (request: Request) => {
  try {
    const id = validateJWT(request);

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { driverProfile: true },
    });

    if (!user || user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.formData();

    const validate = UpdateDriverSchema.safeParse({
      profilePicture: body.get("profilePicture"),
      carPicture: body.get("carPicture"),
      phoneNumber: body.get("phoneNumber"),
      vehicleType: body.get("vehicleType"),
      numberPlate: body.get("numberPlate"),
      numberPlatePicture: body.get("numberPlatePicture"),
      license: body.get("license"),
      licensePicture: body.get("licensePicture"),
      licenseExpiry: body.get("licenseExpiry"),
      roadworthyNumber: body.get("roadworthyNumber"),
      roadworthySticker: body.get("roadworthySticker"),
      roadworthyExpiry: body.get("roadworthyExpiry"),
      insuranceSticker: body.get("insuranceSticker"),
      insurance: body.get("insurance"),
      insuranceExpiry: body.get("insuranceExpiry"),
      ghanaCard: body.get("ghanaCard"),
      ghanaCardPicture: body.get("ghanaCardPicture"),
      address: body.get("address"),
    });

    if (!validate.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: validate.error.format() },
        { status: 400 }
      );
    }

    const filteredData = Object.fromEntries(
      Object.entries(validate.data).filter(
        ([, value]) => value !== null && value !== "" && value !== undefined
      )
    );

    const [existingPhoneNumber, existingLicense, existingNumberPlate] =
      await Promise.all([
        prisma.user.findUnique({
          where: { phone: (filteredData.phoneNumber as string) || "" },
        }),
        prisma.driver.findUnique({
          where: { license: (filteredData.license as string) || "" },
        }),
        prisma.driver.findUnique({
          where: { numberPlate: (filteredData.numberPlate as string) || "" },
        }),
      ]);

    if (existingPhoneNumber && existingPhoneNumber.id !== user.id) {
      return NextResponse.json(
        { error: "Phone number already in use" },
        { status: 409 }
      );
    }

    if (existingLicense && existingLicense.userId !== user.id) {
      return NextResponse.json(
        { error: "License already in use" },
        { status: 409 }
      );
    }

    if (existingNumberPlate && existingNumberPlate.userId !== user.id) {
      return NextResponse.json(
        { error: "Number plate already in use" },
        { status: 409 }
      );
    }

    let profilePicture = null;
    let carPicture = null;
    let numberPlatePicture = null;
    let licensePicture = null;
    let roadworthySticker = null;
    let insuranceSticker = null;
    let ghanaCardPicture = null;

    if (validate.data.profilePicture) {
      if (
        user.driverProfile?.profilePicture &&
        typeof user.driverProfile?.profilePicture === "object" &&
        "id" in user.driverProfile?.profilePicture
      ) {
        await deleteFile(user.driverProfile?.profilePicture.id as string);
      }

      profilePicture = await uploadFile(
        "profile",
        validate.data.profilePicture
      );
    }

    if (validate.data.carPicture) {
      if (
        user.driverProfile?.carPicture &&
        typeof user.driverProfile?.carPicture === "object" &&
        "id" in user.driverProfile?.carPicture
      ) {
        await deleteFile(user.driverProfile?.carPicture.id as string);
      }

      carPicture = await uploadFile("car", validate.data.carPicture);
    }

    if (validate.data.numberPlatePicture) {
      if (
        user.driverProfile?.numberPlatePicture &&
        typeof user.driverProfile?.numberPlatePicture === "object" &&
        "id" in user.driverProfile?.numberPlatePicture
      ) {
        await deleteFile(user.driverProfile?.numberPlatePicture.id as string);
      }

      numberPlatePicture = await uploadFile(
        "number_plate",
        validate.data.numberPlatePicture
      );
    }

    if (validate.data.licensePicture) {
      if (
        user.driverProfile?.licensePicture &&
        typeof user.driverProfile?.licensePicture === "object" &&
        "id" in user.driverProfile?.licensePicture
      ) {
        await deleteFile(user.driverProfile?.licensePicture.id as string);
      }

      licensePicture = await uploadFile(
        "license",
        validate.data.licensePicture
      );
    }

    if (validate.data.roadworthySticker) {
      if (
        user.driverProfile?.roadworthySticker &&
        typeof user.driverProfile?.roadworthySticker === "object" &&
        "id" in user.driverProfile?.roadworthySticker
      ) {
        await deleteFile(user.driverProfile?.roadworthySticker.id as string);
      }

      roadworthySticker = await uploadFile(
        "roadworthy",
        validate.data.roadworthySticker
      );
    }

    if (validate.data.insuranceSticker) {
      if (
        user.driverProfile?.insuranceSticker &&
        typeof user.driverProfile?.insuranceSticker === "object" &&
        "id" in user.driverProfile?.insuranceSticker
      ) {
        await deleteFile(user.driverProfile?.insuranceSticker.id as string);
      }

      insuranceSticker = await uploadFile(
        "insurance",
        validate.data.insuranceSticker
      );
    }

    if (validate.data.ghanaCardPicture) {
      if (
        user.driverProfile?.ghanaCardPicture &&
        typeof user.driverProfile?.ghanaCardPicture === "object" &&
        "id" in user.driverProfile?.ghanaCardPicture
      ) {
        await deleteFile(user.driverProfile?.ghanaCardPicture.id as string);
      }

      ghanaCardPicture = await uploadFile(
        "ghana_card",
        validate.data.ghanaCardPicture
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          address: validate.data.address || user.address || "",
          phone: (validate.data.phoneNumber as string) || user.phone || null,
          image: profilePicture || user.image || undefined,
        },
      });

      return await tx.driver.upsert({
        where: { userId: user.id },
        update: {
          insurance:
            validate.data.insurance || user.driverProfile?.insurance || null,
          ghanaCard:
            validate.data.ghanaCard || user.driverProfile?.ghanaCard || null,
          numberPlate:
            validate.data.numberPlate ||
            user.driverProfile?.numberPlate ||
            null,
          license: validate.data.license || user.driverProfile?.license || null,
          vehicleId:
            validate.data.vehicleId || user.driverProfile?.vehicleId || "",
          licenseExpiry: validate.data.licenseExpiry
            ? new Date(validate.data.licenseExpiry)
            : user.driverProfile?.licenseExpiry,
          roadworthyNumber: validate.data.roadworthyNumber
            ? validate.data.roadworthyNumber
            : user.driverProfile?.roadworthyNumber,
          roadworthyExpiry: validate.data.roadworthyExpiry
            ? new Date(validate.data.roadworthyExpiry)
            : user.driverProfile?.roadworthyExpiry,
          profilePicture:
            profilePicture || user.driverProfile?.profilePicture || undefined,
          carPicture: carPicture || user.driverProfile?.carPicture || undefined,
          numberPlatePicture:
            numberPlatePicture ||
            user.driverProfile?.numberPlatePicture ||
            undefined,
          licensePicture:
            licensePicture || user.driverProfile?.licensePicture || undefined,
          roadworthySticker:
            roadworthySticker ||
            user.driverProfile?.roadworthySticker ||
            undefined,
          insuranceSticker:
            insuranceSticker ||
            user.driverProfile?.insuranceSticker ||
            undefined,
          ghanaCardPicture:
            ghanaCardPicture ||
            user.driverProfile?.ghanaCardPicture ||
            undefined,
          insuranceExpiry: validate.data.insuranceExpiry
            ? new Date(validate.data.insuranceExpiry)
            : user.driverProfile?.insuranceExpiry,
        },
        create: {
          user: { connect: { id: user.id } },
          insurance: validate.data.insurance || null,
          roadworthyNumber: validate.data.roadworthyNumber || null,
          ghanaCard: validate.data.ghanaCard || null,
          numberPlate: validate.data.numberPlate || null,
          license: validate.data.license || null,
          vehicle: { connect: { id: validate.data.vehicleId } },
          licenseExpiry: validate.data.licenseExpiry
            ? new Date(validate.data.licenseExpiry)
            : null,
          insuranceExpiry: validate.data.insuranceExpiry
            ? new Date(validate.data.insuranceExpiry)
            : null,
          roadworthyExpiry: validate.data.roadworthyExpiry
            ? new Date(validate.data.roadworthyExpiry as string)
            : null,
          profilePicture: profilePicture || undefined,
          carPicture: carPicture || undefined,
          numberPlatePicture: numberPlatePicture || undefined,
          licensePicture: licensePicture || undefined,
          roadworthySticker: roadworthySticker || undefined,
          insuranceSticker: insuranceSticker || undefined,
          ghanaCardPicture: ghanaCardPicture || undefined,
        },
      });
    });

    return NextResponse.json(
      { message: "Driver updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating KYC:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
