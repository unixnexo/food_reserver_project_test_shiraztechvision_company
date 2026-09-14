-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- DropIndex
DROP INDEX "order_items_childId_date_key";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'ACTIVE';

-- Add to the generated migration.sql (or run separately after):
CREATE UNIQUE INDEX "order_items_child_date_active_unique"
ON "order_items" ("childId", "date")
WHERE "status" = 'ACTIVE';