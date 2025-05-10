/*
  Warnings:

  - You are about to drop the column `discount_type` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `value_type` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `discount_member_id` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value_type` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value` on the `transaction_item` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value_type` on the `transaction_item` table. All the data in the column will be lost.
  - You are about to drop the `discount_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discount_relation_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discount_relation_product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_detail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `discount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountApplyTo" AS ENUM ('ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_MEMBERS', 'MEMBER_TIERS');

-- DropForeignKey
ALTER TABLE "discount_relation" DROP CONSTRAINT "discount_relation_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "discount_relation_member" DROP CONSTRAINT "discount_relation_member_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "discount_relation_member" DROP CONSTRAINT "discount_relation_member_product_id_fkey";

-- DropForeignKey
ALTER TABLE "discount_relation_product" DROP CONSTRAINT "discount_relation_product_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "discount_relation_product" DROP CONSTRAINT "discount_relation_product_product_id_fkey";

-- DropForeignKey
ALTER TABLE "report_detail" DROP CONSTRAINT "report_detail_report_id_fkey";

-- AlterTable
ALTER TABLE "discount" DROP COLUMN "discount_type",
DROP COLUMN "value_type",
ADD COLUMN     "apply_to" "DiscountApplyTo" DEFAULT 'ALL',
ADD COLUMN     "code" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_uses" INTEGER,
ADD COLUMN     "type" "DiscountType" NOT NULL,
ADD COLUMN     "used_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "discount_member_id",
DROP COLUMN "discount_value",
DROP COLUMN "discount_value_type",
ADD COLUMN     "discount_id" TEXT;

-- AlterTable
ALTER TABLE "transaction_item" DROP COLUMN "discount_value",
DROP COLUMN "discount_value_type";

-- DropTable
DROP TABLE "discount_relation";

-- DropTable
DROP TABLE "discount_relation_member";

-- DropTable
DROP TABLE "discount_relation_product";

-- DropTable
DROP TABLE "expense";

-- DropTable
DROP TABLE "financial_report";

-- DropTable
DROP TABLE "report_detail";

-- CreateTable
CREATE TABLE "_DiscountToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscountToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DiscountToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscountToMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiscountToProduct_B_index" ON "_DiscountToProduct"("B");

-- CreateIndex
CREATE INDEX "_DiscountToMember_B_index" ON "_DiscountToMember"("B");

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_key" ON "discount"("code");

-- CreateIndex
CREATE INDEX "discount_code_idx" ON "discount"("code");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToProduct" ADD CONSTRAINT "_DiscountToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToProduct" ADD CONSTRAINT "_DiscountToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToMember" ADD CONSTRAINT "_DiscountToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToMember" ADD CONSTRAINT "_DiscountToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
