/*
  Warnings:

  - You are about to alter the column `value` on the `discount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `min_purchase` on the `discount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "discount" ALTER COLUMN "value" SET DATA TYPE INTEGER,
ALTER COLUMN "min_purchase" SET DATA TYPE INTEGER;
