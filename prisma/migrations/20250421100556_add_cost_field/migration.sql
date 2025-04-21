/*
  Warnings:

  - Added the required column `cost` to the `transaction_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "cost" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "transaction_item" ADD COLUMN     "cost" INTEGER NOT NULL;
