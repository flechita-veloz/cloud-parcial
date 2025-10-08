-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "loanId" TEXT;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE SET NULL ON UPDATE CASCADE;
