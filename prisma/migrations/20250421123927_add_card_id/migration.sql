/*
  Warnings:

  - Added the required column `card_id` to the `member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "member" ADD COLUMN     "card_id" TEXT NOT NULL;
