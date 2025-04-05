/*
  Warnings:

  - You are about to alter the column `amount` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `total_revenue` on the `financial_report` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `total_profit` on the `financial_report` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `buy_price` on the `product_batch` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `product_variant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `amount` on the `report_detail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `total_amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discount_amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `final_amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price_per_unit` on the `transaction_item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `subtotal` on the `transaction_item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `conversion_factor` on the `unit_conversion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "expense" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "financial_report" ALTER COLUMN "total_revenue" SET DATA TYPE INTEGER,
ALTER COLUMN "total_profit" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "product_batch" ALTER COLUMN "buy_price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "product_variant" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "report_detail" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "total_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "discount_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "final_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "transaction_item" ALTER COLUMN "price_per_unit" SET DATA TYPE INTEGER,
ALTER COLUMN "subtotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "unit_conversion" ALTER COLUMN "conversion_factor" SET DATA TYPE INTEGER;
