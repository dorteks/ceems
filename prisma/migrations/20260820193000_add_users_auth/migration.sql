-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMINISTRATOR', 'DATA_MANAGER', 'SUPERVISOR', 'ENUMERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "Hub" AS ENUM ('ALL', 'OSOGBO', 'EDE', 'ILE_IFE', 'ILESA');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "hub" "Hub" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_hub_idx" ON "users"("hub");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- Seed super admin
INSERT INTO "users" (
    "username",
    "name",
    "email",
    "phone",
    "role",
    "hub",
    "status",
    "password_hash",
    "must_change_password",
    "created_at",
    "updated_at"
) VALUES (
    'superadmin',
    'Adaeze Ogunsanya',
    'adaeze@utility.ng',
    '08030000001',
    'SUPER_ADMINISTRATOR',
    'ALL',
    'ACTIVE',
    'scrypt$47ad59f0369698aafce55f63e57df68e$fac759de6b25238f3abe8c596f7d3b1db6c2ad561dc58aa7079ed80e4082e8c9e8ade5e17423814ceb47c1440b8996ecd232ce29bc03b5d7a49e7dc910837b38',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
