/*
  Warnings:

  - You are about to drop the column `baseFare` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `perKmRate` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `perMinRate` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `Pricing` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `Pricing` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Pricing_serviceType_key";

-- AlterTable
ALTER TABLE "Pricing" DROP COLUMN "baseFare",
DROP COLUMN "perKmRate",
DROP COLUMN "perMinRate",
DROP COLUMN "serviceType",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL;
