-- AlterTable
ALTER TABLE "member" ADD COLUMN     "ban_reason" TEXT,
ADD COLUMN     "is_banned" BOOLEAN DEFAULT false;
