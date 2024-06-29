/*
  Warnings:

  - Made the column `ristoranteId` on table `OrarioDiApertura` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OrarioDiApertura" DROP CONSTRAINT "OrarioDiApertura_ristoranteId_fkey";

-- AlterTable
ALTER TABLE "OrarioDiApertura" ALTER COLUMN "ristoranteId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OrarioDiApertura" ADD CONSTRAINT "OrarioDiApertura_ristoranteId_fkey" FOREIGN KEY ("ristoranteId") REFERENCES "Ristorante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
