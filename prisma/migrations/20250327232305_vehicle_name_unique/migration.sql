/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_name_key" ON "Vehicle"("name");
