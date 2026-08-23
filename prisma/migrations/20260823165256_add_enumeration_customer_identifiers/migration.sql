/*
  Warnings:

  - Added the required column `account_number` to the `customer_enumerations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer_enumerations"
ADD COLUMN "account_number" TEXT;

ALTER TABLE "customer_enumerations"
ADD COLUMN "meter_number" TEXT;

UPDATE "customer_enumerations" ce
SET
  "account_number" = c."account_number",
  "meter_number" = c."meter_number"
FROM "Customer" c
WHERE ce."customer_id" = c."id";

ALTER TABLE "customer_enumerations"
ALTER COLUMN "account_number" SET NOT NULL;
