-- AlterTable
ALTER TABLE "reward" ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "expiry_date" SET DATA TYPE TIMESTAMPTZ;
