-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "scheduler_job" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "handler" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_run" TIMESTAMPTZ,
    "next_run" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "scheduler_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduler_job_log" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER,
    "records" INTEGER,
    "message" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduler_job_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scheduler_job_name_key" ON "scheduler_job"("name");

-- AddForeignKey
ALTER TABLE "scheduler_job_log" ADD CONSTRAINT "scheduler_job_log_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "scheduler_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
