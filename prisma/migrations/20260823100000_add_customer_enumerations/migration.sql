-- CreateTable
CREATE TABLE "customer_enumerations" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "user_name" TEXT NOT NULL,
    "service_center" "ServiceCenter",
    "enumerated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "before_data" JSONB,
    "after_data" JSONB,

    CONSTRAINT "customer_enumerations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_enumerations_customer_id_enumerated_at_idx" ON "customer_enumerations"("customer_id", "enumerated_at");

-- CreateIndex
CREATE INDEX "customer_enumerations_enumerated_at_idx" ON "customer_enumerations"("enumerated_at");

-- CreateIndex
CREATE INDEX "customer_enumerations_service_center_idx" ON "customer_enumerations"("service_center");

-- CreateIndex
CREATE INDEX "customer_enumerations_user_id_idx" ON "customer_enumerations"("user_id");

-- AddForeignKey
ALTER TABLE "customer_enumerations" ADD CONSTRAINT "customer_enumerations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_enumerations" ADD CONSTRAINT "customer_enumerations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
