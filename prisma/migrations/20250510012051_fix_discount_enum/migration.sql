/*
  Warnings:

  - The values [MEMBER_TIERS] on the enum `DiscountApplyTo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountApplyTo_new" AS ENUM ('SPECIFIC_PRODUCTS', 'SPECIFIC_MEMBERS', 'SPECIFIC_MEMBER_TIERS');
ALTER TABLE "discount" ALTER COLUMN "apply_to" TYPE "DiscountApplyTo_new" USING ("apply_to"::text::"DiscountApplyTo_new");
ALTER TYPE "DiscountApplyTo" RENAME TO "DiscountApplyTo_old";
ALTER TYPE "DiscountApplyTo_new" RENAME TO "DiscountApplyTo";
DROP TYPE "DiscountApplyTo_old";
COMMIT;
