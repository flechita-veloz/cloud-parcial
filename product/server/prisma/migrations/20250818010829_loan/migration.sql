-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_loanId_fkey";

-- AlterTable
ALTER TABLE "Loans" ADD COLUMN     "state" TEXT NOT NULL DEFAULT 'Por devolver';
