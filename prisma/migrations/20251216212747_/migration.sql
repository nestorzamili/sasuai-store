/*
  Warnings:

  - A unique constraint covering the columns `[sku_code,barcode]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "product_sku_code_barcode_key" ON "public"."product"("sku_code", "barcode");
