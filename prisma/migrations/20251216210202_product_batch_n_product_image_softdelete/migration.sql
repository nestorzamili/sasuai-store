-- AlterTable
ALTER TABLE "public"."product_batch" ADD COLUMN     "deletedAt" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "public"."product_image" ADD COLUMN     "deletedAt" TIMESTAMPTZ;
