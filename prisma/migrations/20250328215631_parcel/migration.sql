/*
  Warnings:

  - You are about to alter the column `discount` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Dispatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pricing` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `amount` on table `Bid` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `parcelId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_orderId_fkey";

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "amount" SET NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentMethod",
ADD COLUMN     "parcelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "weight" DROP NOT NULL;

-- DropTable
DROP TABLE "Dispatch";

-- DropTable
DROP TABLE "Pricing";

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_name_key" ON "Parcel"("name");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
