-- Step 1: add new columns as nullable first
ALTER TABLE "portion_pricing"
  ADD COLUMN "dailyHalfPrice" INTEGER,
  ADD COLUMN "dailyFullPrice" INTEGER,
  ADD COLUMN "monthlyHalfPrice" INTEGER,
  ADD COLUMN "monthlyFullPrice" INTEGER;

-- Step 2: backfill from the old columns (same price for daily/monthly initially — admin can change later)
UPDATE "portion_pricing"
SET "dailyHalfPrice" = "halfPortionPrice",
    "dailyFullPrice" = "fullPortionPrice",
    "monthlyHalfPrice" = "halfPortionPrice",
    "monthlyFullPrice" = "fullPortionPrice";

-- Step 3: now make them required
ALTER TABLE "portion_pricing"
  ALTER COLUMN "dailyHalfPrice" SET NOT NULL,
  ALTER COLUMN "dailyFullPrice" SET NOT NULL,
  ALTER COLUMN "monthlyHalfPrice" SET NOT NULL,
  ALTER COLUMN "monthlyFullPrice" SET NOT NULL;

-- Step 4: drop the old columns
ALTER TABLE "portion_pricing"
  DROP COLUMN "fullPortionPrice",
  DROP COLUMN "halfPortionPrice";

-- Step 5: partial unique index, idempotent
DROP INDEX IF EXISTS "order_items_child_date_active_unique";
CREATE UNIQUE INDEX "order_items_child_date_active_unique"
ON "order_items" ("childId", "date")
WHERE "status" = 'ACTIVE';