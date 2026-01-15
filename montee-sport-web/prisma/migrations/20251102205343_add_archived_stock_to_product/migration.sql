-- AlterTable
ALTER TABLE "public"."product" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
