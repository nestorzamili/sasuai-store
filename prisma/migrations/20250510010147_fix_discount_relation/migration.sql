/*
  Warnings:

  - The values [ALL] on the enum `DiscountApplyTo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountApplyTo_new" AS ENUM ('SPECIFIC_PRODUCTS', 'SPECIFIC_MEMBERS', 'MEMBER_TIERS');
ALTER TABLE "discount" ALTER COLUMN "apply_to" DROP DEFAULT;
ALTER TABLE "discount" ALTER COLUMN "apply_to" TYPE "DiscountApplyTo_new" USING ("apply_to"::text::"DiscountApplyTo_new");
ALTER TYPE "DiscountApplyTo" RENAME TO "DiscountApplyTo_old";
ALTER TYPE "DiscountApplyTo_new" RENAME TO "DiscountApplyTo";
DROP TYPE "DiscountApplyTo_old";
COMMIT;

-- AlterTable
ALTER TABLE "discount" ALTER COLUMN "apply_to" DROP DEFAULT;

-- CreateTable
CREATE TABLE "_DiscountToMemberTier" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscountToMemberTier_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiscountToMemberTier_B_index" ON "_DiscountToMemberTier"("B");

-- AddForeignKey
ALTER TABLE "_DiscountToMemberTier" ADD CONSTRAINT "_DiscountToMemberTier_A_fkey" FOREIGN KEY ("A") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToMemberTier" ADD CONSTRAINT "_DiscountToMemberTier_B_fkey" FOREIGN KEY ("B") REFERENCES "member_tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
