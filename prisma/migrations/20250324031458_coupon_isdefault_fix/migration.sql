/*
  Warnings:

  - You are about to drop the column `isDefaut` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "isDefaut",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
