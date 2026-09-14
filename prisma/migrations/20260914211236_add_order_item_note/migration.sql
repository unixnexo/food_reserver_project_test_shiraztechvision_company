/*
  Warnings:

  - You are about to drop the column `dailyFullPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `dailyHalfPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyFullPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyHalfPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - Added the required column `fullPortionPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `halfPortionPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "portion_pricing" DROP COLUMN "dailyFullPrice",
DROP COLUMN "dailyHalfPrice",
DROP COLUMN "monthlyFullPrice",
DROP COLUMN "monthlyHalfPrice",
ADD COLUMN     "fullPortionPrice" INTEGER NOT NULL,
ADD COLUMN     "halfPortionPrice" INTEGER NOT NULL;
