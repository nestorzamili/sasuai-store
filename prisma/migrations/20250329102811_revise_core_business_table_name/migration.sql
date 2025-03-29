/*
  Warnings:

  - You are about to drop the `barcodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_points` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_tiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_batches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reward_claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_ins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_outs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "barcodes" DROP CONSTRAINT "barcodes_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "member_discounts" DROP CONSTRAINT "member_discounts_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "member_discounts" DROP CONSTRAINT "member_discounts_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "member_points" DROP CONSTRAINT "member_points_member_id_fkey";

-- DropForeignKey
ALTER TABLE "member_points" DROP CONSTRAINT "member_points_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "product_batches" DROP CONSTRAINT "product_batches_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_discounts" DROP CONSTRAINT "product_discounts_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "product_discounts" DROP CONSTRAINT "product_discounts_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "report_details" DROP CONSTRAINT "report_details_report_id_fkey";

-- DropForeignKey
ALTER TABLE "reward_claims" DROP CONSTRAINT "reward_claims_member_id_fkey";

-- DropForeignKey
ALTER TABLE "reward_claims" DROP CONSTRAINT "reward_claims_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_ins" DROP CONSTRAINT "stock_ins_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_ins" DROP CONSTRAINT "stock_ins_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_ins" DROP CONSTRAINT "stock_ins_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_outs" DROP CONSTRAINT "stock_outs_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_outs" DROP CONSTRAINT "stock_outs_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_items" DROP CONSTRAINT "transaction_items_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_items" DROP CONSTRAINT "transaction_items_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_items" DROP CONSTRAINT "transaction_items_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_items" DROP CONSTRAINT "transaction_items_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_cashier_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_member_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_conversions" DROP CONSTRAINT "unit_conversions_from_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_conversions" DROP CONSTRAINT "unit_conversions_to_unit_id_fkey";

-- DropTable
DROP TABLE "barcodes";

-- DropTable
DROP TABLE "brands";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "discounts";

-- DropTable
DROP TABLE "expenses";

-- DropTable
DROP TABLE "financial_reports";

-- DropTable
DROP TABLE "member_discounts";

-- DropTable
DROP TABLE "member_points";

-- DropTable
DROP TABLE "member_tiers";

-- DropTable
DROP TABLE "members";

-- DropTable
DROP TABLE "product_batches";

-- DropTable
DROP TABLE "product_discounts";

-- DropTable
DROP TABLE "product_images";

-- DropTable
DROP TABLE "product_variants";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "report_details";

-- DropTable
DROP TABLE "reward_claims";

-- DropTable
DROP TABLE "rewards";

-- DropTable
DROP TABLE "stock_ins";

-- DropTable
DROP TABLE "stock_outs";

-- DropTable
DROP TABLE "suppliers";

-- DropTable
DROP TABLE "transaction_items";

-- DropTable
DROP TABLE "transactions";

-- DropTable
DROP TABLE "units";

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "sku_code" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_batch" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "expiry_date" DATE NOT NULL,
    "initial_quantity" INTEGER NOT NULL,
    "remaining_quantity" INTEGER NOT NULL,
    "buy_price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "barcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "min_purchase" DECIMAL(65,30),
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_discount" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_tier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_points" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "member_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_discount" (
    "id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "member_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "tier_id" TEXT,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "join_date" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_point" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "points_earned" INTEGER NOT NULL,
    "date_earned" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "member_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claim" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "claim_date" TIMESTAMPTZ NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reward_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_in" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "supplier_id" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_in_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_out" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_out_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "cashier_id" TEXT NOT NULL,
    "member_id" TEXT,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL,
    "final_amount" DECIMAL(65,30) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_item" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "price_per_unit" DECIMAL(65,30) NOT NULL,
    "discount_id" TEXT,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transaction_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_report" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "total_revenue" DECIMAL(65,30) NOT NULL,
    "total_profit" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "financial_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_detail" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "report_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_from_unit_id_fkey" FOREIGN KEY ("from_unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_to_unit_id_fkey" FOREIGN KEY ("to_unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batch" ADD CONSTRAINT "product_batch_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcode" ADD CONSTRAINT "barcode_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_discount" ADD CONSTRAINT "product_discount_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_discount" ADD CONSTRAINT "product_discount_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_discount" ADD CONSTRAINT "member_discount_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "member_tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_discount" ADD CONSTRAINT "member_discount_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "member_tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_point" ADD CONSTRAINT "member_point_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_point" ADD CONSTRAINT "member_point_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim" ADD CONSTRAINT "reward_claim_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim" ADD CONSTRAINT "reward_claim_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in" ADD CONSTRAINT "stock_in_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in" ADD CONSTRAINT "stock_in_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in" ADD CONSTRAINT "stock_in_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out" ADD CONSTRAINT "stock_out_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out" ADD CONSTRAINT "stock_out_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_detail" ADD CONSTRAINT "report_detail_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "financial_report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
