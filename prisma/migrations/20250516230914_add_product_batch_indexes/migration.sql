-- CreateIndex
CREATE INDEX "product_batch_product_id_idx" ON "product_batch"("product_id");

-- CreateIndex
CREATE INDEX "product_batch_expiry_date_idx" ON "product_batch"("expiry_date");

-- CreateIndex
CREATE INDEX "product_batch_remaining_quantity_idx" ON "product_batch"("remaining_quantity");

-- CreateIndex
CREATE INDEX "product_batch_createdAt_idx" ON "product_batch"("createdAt");

-- CreateIndex
CREATE INDEX "product_batch_batch_code_idx" ON "product_batch"("batch_code");
