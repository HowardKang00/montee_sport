-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "colorway" TEXT NOT NULL,
    "price" DECIMAL(9,2) NOT NULL,
    "discount" DECIMAL(9,2) NOT NULL,
    "gender" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "sizeCharts" TEXT[],
    "sizes" TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
