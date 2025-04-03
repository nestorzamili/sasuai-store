/*
  Warnings:

  - You are about to drop the column `type` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the `member_discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit_conversions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discount_type` to the `discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_type` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "member_discount" DROP CONSTRAINT "member_discount_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "member_discount" DROP CONSTRAINT "member_discount_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "product_discount" DROP CONSTRAINT "product_discount_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "product_discount" DROP CONSTRAINT "product_discount_product_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_item" DROP CONSTRAINT "transaction_item_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_conversions" DROP CONSTRAINT "unit_conversions_from_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_conversions" DROP CONSTRAINT "unit_conversions_to_unit_id_fkey";

-- AlterTable
ALTER TABLE "discount" DROP COLUMN "type",
ADD COLUMN     "discount_type" TEXT NOT NULL,
ADD COLUMN     "value_type" TEXT NOT NULL;

-- DropTable
DROP TABLE "member_discount";

-- DropTable
DROP TABLE "product_discount";

-- DropTable
DROP TABLE "unit_conversions";

-- CreateTable
CREATE TABLE "unit_conversion" (
    "id" TEXT NOT NULL,
    "from_unit_id" TEXT NOT NULL,
    "to_unit_id" TEXT NOT NULL,
    "conversion_factor" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "unit_conversion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unit_conversion" ADD CONSTRAINT "unit_conversion_from_unit_id_fkey" FOREIGN KEY ("from_unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversion" ADD CONSTRAINT "unit_conversion_to_unit_id_fkey" FOREIGN KEY ("to_unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
