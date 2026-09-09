/*
  Warnings:

  - The values [PREPAID] on the enum `MeterType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeterType_new" AS ENUM ('LONGI', 'MOJEC', 'MOMAS', 'PROTOGY', 'HEXIN', 'IRL', 'NSTS', 'POSTPAID', 'TC_AND_P', 'HOLLEY', 'NEW_HAMPSHIRE');
ALTER TABLE "Customer" ALTER COLUMN "meter_type" TYPE "MeterType_new" USING ("meter_type"::text::"MeterType_new");
ALTER TYPE "MeterType" RENAME TO "MeterType_old";
ALTER TYPE "MeterType_new" RENAME TO "MeterType";
DROP TYPE "public"."MeterType_old";
COMMIT;
