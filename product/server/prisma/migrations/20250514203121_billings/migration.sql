/*
  Warnings:

  - The `state` column on the `Billings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDIENTE', 'EXCEPCION', 'ACEPTADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "Billings" DROP COLUMN "state",
ADD COLUMN     "state" "BillingStatus" NOT NULL DEFAULT 'PENDIENTE';
