/*
  Warnings:

  - You are about to drop the column `fullPortionPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `halfPortionPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - Added the required column `dailyFullPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyHalfPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyFullPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyHalfPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "portion_pricing" DROP COLUMN "fullPortionPrice",
DROP COLUMN "halfPortionPrice",
ADD COLUMN     "dailyFullPrice" INTEGER NOT NULL,
ADD COLUMN     "dailyHalfPrice" INTEGER NOT NULL,
ADD COLUMN     "monthlyFullPrice" INTEGER NOT NULL,
ADD COLUMN     "monthlyHalfPrice" INTEGER NOT NULL;
