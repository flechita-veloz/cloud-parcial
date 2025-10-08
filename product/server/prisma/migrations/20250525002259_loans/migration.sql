/*
  Warnings:

  - You are about to drop the column `state` on the `Loans` table. All the data in the column will be lost.
  - You are about to drop the column `wasReturned` on the `SalesDetail` table. All the data in the column will be lost.
  - You are about to drop the column `wasSold` on the `SalesDetail` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loanId]` on the table `Sales` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SalesDetailStatus" AS ENUM ('POR_DEVOLVER', 'DEVUELTO', 'VENDIDO');

-- AlterTable
ALTER TABLE "Loans" DROP COLUMN "state";

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "loanId" TEXT;

-- AlterTable
ALTER TABLE "SalesDetail" DROP COLUMN "wasReturned",
DROP COLUMN "wasSold",
ADD COLUMN     "status" "SalesDetailStatus" NOT NULL DEFAULT 'VENDIDO';

-- CreateIndex
CREATE UNIQUE INDEX "Sales_loanId_key" ON "Sales"("loanId");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE SET NULL ON UPDATE CASCADE;
