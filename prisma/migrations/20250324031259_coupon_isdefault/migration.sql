/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiry` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "expiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isDefaut" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
