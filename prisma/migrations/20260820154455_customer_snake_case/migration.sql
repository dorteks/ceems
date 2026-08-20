/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `customerCategory` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `customerType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `meterPhase` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `otherName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `premiseType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCenter` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_number]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[meter_number]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_number` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeterType" AS ENUM ('PREPAID', 'POSTPAID');

-- DropIndex
DROP INDEX "Customer_accountNumber_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "accountNumber",
DROP COLUMN "createdAt",
DROP COLUMN "customerCategory",
DROP COLUMN "customerType",
DROP COLUMN "firstName",
DROP COLUMN "meterPhase",
DROP COLUMN "otherName",
DROP COLUMN "premiseType",
DROP COLUMN "serviceCenter",
DROP COLUMN "updatedAt",
ADD COLUMN     "account_number" TEXT NOT NULL,
ADD COLUMN     "business_hub" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "customer_category" "CustomerCategory",
ADD COLUMN     "customer_type" "CustomerType",
ADD COLUMN     "dss_id" TEXT,
ADD COLUMN     "dss_name" TEXT,
ADD COLUMN     "enumerator_id" TEXT,
ADD COLUMN     "enumerator_name" TEXT,
ADD COLUMN     "enumerator_phone_number" TEXT,
ADD COLUMN     "feeder_band" TEXT,
ADD COLUMN     "feeder_id" TEXT,
ADD COLUMN     "feeder_name" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "meter_number" TEXT,
ADD COLUMN     "meter_phase" "MeterPhase",
ADD COLUMN     "meter_type" "MeterType",
ADD COLUMN     "nature_of_business" TEXT,
ADD COLUMN     "other_name" TEXT,
ADD COLUMN     "premise_type" "PremiseType",
ADD COLUMN     "region" TEXT,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "service_center" "ServiceCenter",
ADD COLUMN     "service_code" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "tariff" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_account_number_key" ON "Customer"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_meter_number_key" ON "Customer"("meter_number");

-- CreateIndex
CREATE INDEX "Customer_meter_number_idx" ON "Customer"("meter_number");

-- CreateIndex
CREATE INDEX "Customer_customer_type_idx" ON "Customer"("customer_type");

-- CreateIndex
CREATE INDEX "Customer_customer_category_idx" ON "Customer"("customer_category");

-- CreateIndex
CREATE INDEX "Customer_service_center_idx" ON "Customer"("service_center");

-- CreateIndex
CREATE INDEX "Customer_state_idx" ON "Customer"("state");

-- CreateIndex
CREATE INDEX "Customer_lga_idx" ON "Customer"("lga");

-- CreateIndex
CREATE INDEX "Customer_dss_id_idx" ON "Customer"("dss_id");

-- CreateIndex
CREATE INDEX "Customer_feeder_id_idx" ON "Customer"("feeder_id");

-- CreateIndex
CREATE INDEX "Customer_enumerator_id_idx" ON "Customer"("enumerator_id");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");
