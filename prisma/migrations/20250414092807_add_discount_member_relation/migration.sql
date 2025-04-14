/*
  Warnings:

  - The primary key for the `discount_relation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[discount_id]` on the table `discount_relation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "discount_relation" DROP CONSTRAINT "discount_relation_pkey",
ADD CONSTRAINT "discount_relation_pkey" PRIMARY KEY ("discount_id");

-- CreateTable
CREATE TABLE "discount_relation_product" (
    "discount_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "discount_relation_member" (
    "discount_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_relation_product_discount_id_product_id_key" ON "discount_relation_product"("discount_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_relation_member_discount_id_product_id_key" ON "discount_relation_member"("discount_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_relation_discount_id_key" ON "discount_relation"("discount_id");

-- AddForeignKey
ALTER TABLE "discount_relation_product" ADD CONSTRAINT "discount_relation_product_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_product" ADD CONSTRAINT "discount_relation_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_member" ADD CONSTRAINT "discount_relation_member_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_relation_member" ADD CONSTRAINT "discount_relation_member_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
