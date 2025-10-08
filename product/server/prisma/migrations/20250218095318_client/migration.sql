-- AlterTable
ALTER TABLE "Clients" ADD COLUMN     "address" TEXT,
ADD COLUMN     "mail" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;
