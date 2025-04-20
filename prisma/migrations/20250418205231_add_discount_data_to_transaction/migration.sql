-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "discount_member_id" TEXT,
ADD COLUMN     "discount_value" INTEGER,
ADD COLUMN     "discount_value_type" TEXT,
ALTER COLUMN "discount_amount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transaction_item" ADD COLUMN     "discount_amount" INTEGER,
ADD COLUMN     "discount_value" INTEGER,
ADD COLUMN     "discount_value_type" TEXT;
