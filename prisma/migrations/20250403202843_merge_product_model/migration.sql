/*
  Warnings:

  - You are about to drop the column `variant_id` on the `product_batch` table. All the data in the column will be lost.
  - You are about to drop the `barcode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "barcode" DROP CONSTRAINT "barcode_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "product_batch" DROP CONSTRAINT "product_batch_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant" DROP CONSTRAINT "product_variant_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant" DROP CONSTRAINT "product_variant_unit_id_fkey";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "current_stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "sku_code" TEXT,
ADD COLUMN     "unit_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_batch" DROP COLUMN "variant_id",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "barcode";

-- DropTable
DROP TABLE "product_variant";

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batch" ADD CONSTRAINT "product_batch_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
