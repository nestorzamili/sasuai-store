-- AlterTable
ALTER TABLE "public"."product" ADD COLUMN     "deletedAt" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "public"."scheduler_job_log" ALTER COLUMN "end_time" DROP NOT NULL;
