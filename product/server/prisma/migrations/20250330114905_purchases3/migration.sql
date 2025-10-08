-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_saleId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "saleId" DROP NOT NULL,
ALTER COLUMN "purchaseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchases"("purchaseId") ON DELETE SET NULL ON UPDATE CASCADE;
