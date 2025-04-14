-- AlterTable
ALTER TABLE "discount_relation_member" ADD CONSTRAINT "discount_relation_member_pkey" PRIMARY KEY ("discount_id", "product_id");

-- DropIndex
DROP INDEX "discount_relation_member_discount_id_product_id_key";

-- AlterTable
ALTER TABLE "discount_relation_product" ADD CONSTRAINT "discount_relation_product_pkey" PRIMARY KEY ("discount_id", "product_id");

-- DropIndex
DROP INDEX "discount_relation_product_discount_id_product_id_key";
