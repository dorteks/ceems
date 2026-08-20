-- CreateEnum
CREATE TYPE "ServiceCenter" AS ENUM ('AYEPE_1', 'AYEPE_2', 'AYETORO', 'GRA', 'KELEBE_1', 'KELEBE_2', 'OGO_OLUWA', 'OKE_FIA', 'OSOGBO_1', 'OSOGBO_2', 'OTA_EFUN');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('PREPAID', 'POSTPAID');

-- CreateEnum
CREATE TYPE "PremiseType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "MeterPhase" AS ENUM ('Q1', 'Q3', 'WHOLE_CURRENT', 'LVMD', 'HVMD');

-- CreateEnum
CREATE TYPE "CustomerCategory" AS ENUM ('MD1', 'MD2', 'NMD');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "otherName" TEXT,
    "nin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "customerType" "CustomerType",
    "customerCategory" "CustomerCategory",
    "premiseType" "PremiseType",
    "meterPhase" "MeterPhase",
    "serviceCenter" "ServiceCenter",
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "lga" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_accountNumber_key" ON "Customer"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_nin_key" ON "Customer"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
