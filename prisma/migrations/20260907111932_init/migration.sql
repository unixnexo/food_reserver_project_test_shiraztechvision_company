/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "grades_order_key" ON "grades"("order");
