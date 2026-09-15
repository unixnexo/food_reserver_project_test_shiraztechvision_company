-- CreateTable
CREATE TABLE "sides" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_sides" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "sideId" TEXT NOT NULL,

    CONSTRAINT "order_item_sides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sides_name_key" ON "sides"("name");

-- CreateIndex
CREATE INDEX "order_item_sides_orderItemId_idx" ON "order_item_sides"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_sides_orderItemId_sideId_key" ON "order_item_sides"("orderItemId", "sideId");

-- AddForeignKey
ALTER TABLE "order_item_sides" ADD CONSTRAINT "order_item_sides_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_sides" ADD CONSTRAINT "order_item_sides_sideId_fkey" FOREIGN KEY ("sideId") REFERENCES "sides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
