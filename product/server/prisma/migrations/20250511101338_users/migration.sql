/*
  Warnings:

  - You are about to drop the column `name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Users` table. All the data in the column will be lost.
  - Added the required column `names` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "name",
DROP COLUMN "userName",
ADD COLUMN     "names" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
