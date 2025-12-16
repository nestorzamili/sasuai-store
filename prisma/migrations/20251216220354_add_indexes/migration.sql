/*
  Warnings:

  - A unique constraint covering the columns `[card_id]` on the table `member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "discount_name_idx" ON "public"."discount"("name");

-- CreateIndex
CREATE INDEX "member_email_idx" ON "public"."member"("email");

-- CreateIndex
CREATE INDEX "member_phone_idx" ON "public"."member"("phone");

-- CreateIndex
CREATE INDEX "member_tier_id_idx" ON "public"."member"("tier_id");

-- CreateIndex
CREATE INDEX "member_is_banned_idx" ON "public"."member"("is_banned");

-- CreateIndex
CREATE UNIQUE INDEX "member_card_id_key" ON "public"."member"("card_id");

-- CreateIndex
CREATE INDEX "member_point_member_id_idx" ON "public"."member_point"("member_id");

-- CreateIndex
CREATE INDEX "member_point_transaction_id_idx" ON "public"."member_point"("transaction_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "public"."product"("category_id");

-- CreateIndex
CREATE INDEX "product_brand_id_idx" ON "public"."product"("brand_id");

-- CreateIndex
CREATE INDEX "product_is_active_idx" ON "public"."product"("is_active");

-- CreateIndex
CREATE INDEX "product_deletedAt_idx" ON "public"."product"("deletedAt");

-- CreateIndex
CREATE INDEX "product_name_idx" ON "public"."product"("name");

-- CreateIndex
CREATE INDEX "product_batch_product_id_idx" ON "public"."product_batch"("product_id");

-- CreateIndex
CREATE INDEX "product_batch_expiry_date_idx" ON "public"."product_batch"("expiry_date");

-- CreateIndex
CREATE INDEX "product_batch_remaining_quantity_idx" ON "public"."product_batch"("remaining_quantity");

-- CreateIndex
CREATE INDEX "product_batch_deletedAt_idx" ON "public"."product_batch"("deletedAt");

-- CreateIndex
CREATE INDEX "transaction_cashier_id_idx" ON "public"."transaction"("cashier_id");

-- CreateIndex
CREATE INDEX "transaction_member_id_idx" ON "public"."transaction"("member_id");

-- CreateIndex
CREATE INDEX "transaction_discount_id_idx" ON "public"."transaction"("discount_id");

-- CreateIndex
CREATE INDEX "transaction_createdAt_idx" ON "public"."transaction"("createdAt");

-- CreateIndex
CREATE INDEX "transaction_item_transaction_id_idx" ON "public"."transaction_item"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_item_batch_id_idx" ON "public"."transaction_item"("batch_id");
