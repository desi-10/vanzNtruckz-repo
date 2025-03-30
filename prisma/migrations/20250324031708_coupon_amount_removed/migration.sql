/*
  Warnings:

  - You are about to drop the column `amount` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "amount",
ALTER COLUMN "isActive" SET DEFAULT false;
