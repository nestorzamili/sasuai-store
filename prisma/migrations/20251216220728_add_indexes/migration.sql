-- CreateIndex
CREATE INDEX "transaction_cashier_id_createdAt_idx" ON "public"."transaction"("cashier_id", "createdAt");

-- CreateIndex
CREATE INDEX "transaction_member_id_createdAt_idx" ON "public"."transaction"("member_id", "createdAt");

-- CreateIndex
CREATE INDEX "transaction_item_batch_id_createdAt_idx" ON "public"."transaction_item"("batch_id", "createdAt");
