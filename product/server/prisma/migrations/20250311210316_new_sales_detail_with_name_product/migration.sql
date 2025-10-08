/*
  Warnings:

  - Added the required column `nameProduct` to the `SalesDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesDetail" ADD COLUMN     "nameProduct" TEXT NOT NULL;
