/*
  Warnings:

  - You are about to drop the column `dailyFullPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `dailyHalfPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyFullPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyHalfPrice` on the `portion_pricing` table. All the data in the column will be lost.
  - Added the required column `fullPortionPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `halfPortionPrice` to the `portion_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTransactionReason" AS ENUM ('ADMIN_ADJUSTMENT', 'ORDER_REFUND', 'WALLET_PAYMENT');

-- AlterTable
ALTER TABLE "portion_pricing" DROP COLUMN "dailyFullPrice",
DROP COLUMN "dailyHalfPrice",
DROP COLUMN "monthlyFullPrice",
DROP COLUMN "monthlyHalfPrice",
ADD COLUMN     "fullPortionPrice" INTEGER NOT NULL,
ADD COLUMN     "halfPortionPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "walletBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "reason" "WalletTransactionReason" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "adminId" TEXT,
    "orderId" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_transactions_userId_idx" ON "wallet_transactions"("userId");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
