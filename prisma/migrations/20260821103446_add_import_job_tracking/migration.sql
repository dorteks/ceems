-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('VALIDATED', 'COMMITTED', 'FAILED');

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'VALIDATED',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "invalid_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_rows" INTEGER NOT NULL DEFAULT 0,
    "imported_rows" INTEGER NOT NULL DEFAULT 0,
    "preview_rows" JSONB,
    "validation_errors" JSONB,
    "duplicate_records" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uploaded_by_id" INTEGER,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");

-- CreateIndex
CREATE INDEX "import_jobs_uploaded_at_idx" ON "import_jobs"("uploaded_at");

-- CreateIndex
CREATE INDEX "import_jobs_uploaded_by_id_idx" ON "import_jobs"("uploaded_by_id");

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
