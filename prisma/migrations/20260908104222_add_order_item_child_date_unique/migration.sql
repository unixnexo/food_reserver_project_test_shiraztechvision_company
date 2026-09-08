/*
  Warnings:

  - A unique constraint covering the columns `[childId,date]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_items_childId_date_key" ON "order_items"("childId", "date");
