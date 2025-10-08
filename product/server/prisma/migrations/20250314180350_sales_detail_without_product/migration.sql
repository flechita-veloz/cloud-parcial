/*
  Warnings:

  - You are about to drop the column `productId` on the `SalesDetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalesDetail" DROP CONSTRAINT "SalesDetail_productId_fkey";

-- AlterTable
ALTER TABLE "SalesDetail" DROP COLUMN "productId";
