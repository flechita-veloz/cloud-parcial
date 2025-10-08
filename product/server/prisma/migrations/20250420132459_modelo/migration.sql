/*
  Warnings:

  - You are about to drop the column `amount` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the `ExpenseByCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesSummary` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Expenses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey";

-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "amount",
DROP COLUMN "category",
DROP COLUMN "timestamp",
ADD COLUMN     "RUC" TEXT,
ADD COLUMN     "billingNumber" TEXT,
ADD COLUMN     "billingType" TEXT DEFAULT 'Ninguno',
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ExpenseByCategory";

-- DropTable
DROP TABLE "ExpenseSummary";

-- DropTable
DROP TABLE "PurchaseSummary";

-- DropTable
DROP TABLE "SalesSummary";

-- CreateIndex
CREATE UNIQUE INDEX "Expenses_transactionId_key" ON "Expenses"("transactionId");

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
