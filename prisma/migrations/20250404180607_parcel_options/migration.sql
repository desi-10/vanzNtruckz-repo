-- CreateEnum
CREATE TYPE "ParcelUnitType" AS ENUM ('PCS', 'BOX');

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "unit" "ParcelUnitType" DEFAULT 'PCS';
