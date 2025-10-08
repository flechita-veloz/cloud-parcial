/*
  Warnings:

  - You are about to drop the column `productId` on the `Purchases` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Purchases` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Purchases` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Purchases` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `Purchases` table. All the data in the column will be lost.
  - Added the required column `billingNumber` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseId` to the `SalesDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseId` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_productId_fkey";

-- AlterTable
ALTER TABLE "Purchases" DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "timestamp",
DROP COLUMN "totalCost",
DROP COLUMN "unitCost",
ADD COLUMN     "billingNumber" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "number" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shipping" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "supplierId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesDetail" ADD COLUMN     "purchaseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "purchaseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchases"("purchaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Clients"("clientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchases"("purchaseId") ON DELETE RESTRICT ON UPDATE CASCADE;
