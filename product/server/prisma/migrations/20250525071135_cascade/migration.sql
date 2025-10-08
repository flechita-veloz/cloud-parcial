-- DropForeignKey
ALTER TABLE "Billings" DROP CONSTRAINT "Billings_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_loanId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDetail" DROP CONSTRAINT "SalesDetail_saleId_fkey";

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billings" ADD CONSTRAINT "Billings_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("saleId") ON DELETE CASCADE ON UPDATE CASCADE;
