/*
  Warnings:

  - You are about to drop the `Billing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Billing" DROP CONSTRAINT "Billing_saleId_fkey";

-- DropTable
DROP TABLE "Billing";

-- CreateTable
CREATE TABLE "Billings" (
    "billingId" TEXT NOT NULL,
    "saleId" TEXT,
    "type" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Enviado',
    "number" INTEGER NOT NULL,
    "numberBilling" INTEGER,

    CONSTRAINT "Billings_pkey" PRIMARY KEY ("billingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Billings_saleId_key" ON "Billings"("saleId");

-- AddForeignKey
ALTER TABLE "Billings" ADD CONSTRAINT "Billings_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE SET NULL ON UPDATE CASCADE;
