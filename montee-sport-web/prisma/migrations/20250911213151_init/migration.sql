/*
  Warnings:

  - You are about to drop the column `createdAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeCharts` on the `product` table. All the data in the column will be lost.
  - Added the required column `productid` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."product" DROP COLUMN "createdAt",
DROP COLUMN "productId",
DROP COLUMN "sizeCharts",
ADD COLUMN     "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productid" INTEGER NOT NULL,
ADD COLUMN     "sizecharts" TEXT[];
