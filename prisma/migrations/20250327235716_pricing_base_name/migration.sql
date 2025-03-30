/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Pricing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pricing" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_name_key" ON "Pricing"("name");
