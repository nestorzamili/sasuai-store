-- AlterTable
ALTER TABLE "member" ADD COLUMN     "total_points_earned" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "reward" ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP;
