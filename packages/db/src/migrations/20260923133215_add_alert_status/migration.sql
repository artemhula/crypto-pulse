/*
  Warnings:

  - You are about to drop the column `is_triggered` on the `crypto_alerts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'TRIGGERED', 'EXPIRED');

-- AlterTable
ALTER TABLE "crypto_alerts" DROP COLUMN "is_triggered",
ADD COLUMN     "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE';
