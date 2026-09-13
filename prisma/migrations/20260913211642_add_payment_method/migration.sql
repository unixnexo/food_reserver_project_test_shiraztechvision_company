-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('GATEWAY', 'WALLET');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'GATEWAY';
