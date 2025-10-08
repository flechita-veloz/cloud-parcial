-- DropForeignKey
ALTER TABLE "SalesDetail" DROP CONSTRAINT "SalesDetail_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDetail" DROP CONSTRAINT "SalesDetail_saleId_fkey";

-- AlterTable
ALTER TABLE "SalesDetail" ALTER COLUMN "saleId" DROP NOT NULL,
ALTER COLUMN "purchaseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchases"("purchaseId") ON DELETE SET NULL ON UPDATE CASCADE;
