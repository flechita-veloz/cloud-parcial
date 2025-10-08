-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "origin" TEXT NOT NULL DEFAULT 'Venta';

-- AlterTable
ALTER TABLE "SalesDetail" ADD COLUMN     "loanId" TEXT,
ADD COLUMN     "wasReturned" TEXT,
ADD COLUMN     "wasSold" TEXT;

-- CreateTable
CREATE TABLE "Loans" (
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL,

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("loanId")
);

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("clientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE SET NULL ON UPDATE CASCADE;
