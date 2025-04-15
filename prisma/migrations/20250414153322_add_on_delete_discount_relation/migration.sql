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

-- AddForeignKey
ALTER TABLE "discount_relation" ADD CONSTRAINT "discount_relation_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_product" ADD CONSTRAINT "discount_relation_product_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_product" ADD CONSTRAINT "discount_relation_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_member" ADD CONSTRAINT "discount_relation_member_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_member" ADD CONSTRAINT "discount_relation_member_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
