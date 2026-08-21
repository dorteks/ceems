/*
  Warnings:

  - The `status` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "status",
ADD COLUMN     "status" "Status";

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");
