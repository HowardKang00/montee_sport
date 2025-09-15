/*
  Warnings:

  - A unique constraint covering the columns `[productid]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "product_productid_key" ON "public"."product"("productid");
