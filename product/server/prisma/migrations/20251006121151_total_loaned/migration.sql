/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Loans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loans" DROP COLUMN "totalAmount",
ADD COLUMN     "totalLoanedReturned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalLoanedUnreturned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "state" SET DEFAULT 'POR_DEVOLVER';
