-- AddForeignKey
ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
