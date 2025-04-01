import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  // Hash password for admin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Create sample customers
  await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      name: "Customer One",
      email: "customer1@example.com",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      name: "Customer Two",
      email: "customer2@example.com",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER",
    },
  });

  // Seed Parcels
  await prisma.parcel.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      description: "Fragile electronics and gadgets",
    },
  });

  await prisma.parcel.upsert({
    where: { name: "Clothing" },
    update: {},
    create: {
      name: "Clothing",
      description: "Apparel and fashion accessories",
    },
  });

  // Seed Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discount: 10.0,
      isDefault: false,
      isActive: true,
      expiry: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Expires in 3 months
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      discount: 5.0,
      isDefault: false,
      isActive: true,
      expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Expires in 1 month
    },
  });

  console.log("Seed data inserted successfully!");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
