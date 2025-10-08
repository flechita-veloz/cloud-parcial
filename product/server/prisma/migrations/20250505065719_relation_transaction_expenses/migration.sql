/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Expenses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expenseId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_transactionId_fkey";

-- DropIndex
DROP INDEX "Expenses_transactionId_key";

-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "expenseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_expenseId_key" ON "Transactions"("expenseId");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE SET NULL ON UPDATE CASCADE;
