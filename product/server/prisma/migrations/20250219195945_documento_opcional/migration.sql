/*
  Warnings:

  - You are about to drop the column `document` on the `Clients` table. All the data in the column will be lost.
  - You are about to drop the column `numberBilling` on the `Sales` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Sales` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clients" DROP COLUMN "document";

-- AlterTable
ALTER TABLE "Sales" DROP COLUMN "numberBilling",
DROP COLUMN "type",
ALTER COLUMN "state" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Documents" (
    "documentId" TEXT NOT NULL,
    "clientId" TEXT,
    "typeDocument" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "Billing" (
    "billingId" TEXT NOT NULL,
    "saleId" TEXT,
    "type" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Enviado',
    "number" INTEGER NOT NULL,
    "numberBilling" INTEGER,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("billingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documents_clientId_key" ON "Documents"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Billing_saleId_key" ON "Billing"("saleId");

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("clientId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE SET NULL ON UPDATE CASCADE;
