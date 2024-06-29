-- CreateEnum
CREATE TYPE "Giorno" AS ENUM ('LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM');

-- CreateEnum
CREATE TYPE "Ruolo" AS ENUM ('ADMIN', 'RISTORATORE');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ruolo" "Ruolo" NOT NULL,
    "statoAttivo" BOOLEAN NOT NULL DEFAULT true,
    "nome" TEXT,
    "cognome" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ristorante" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ragioneSociale" TEXT NOT NULL,
    "piva" INTEGER NOT NULL,
    "via" TEXT NOT NULL,
    "cap" INTEGER NOT NULL,
    "comune" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "stato" TEXT NOT NULL,
    "codiceSdi" TEXT,
    "pec" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Ristorante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaCompentenza" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ristoranteId" INTEGER NOT NULL,

    CONSTRAINT "AreaCompentenza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CateogorieOnAree" (
    "categoriaId" INTEGER NOT NULL,
    "areaCompentenzaId" INTEGER NOT NULL,

    CONSTRAINT "CateogorieOnAree_pkey" PRIMARY KEY ("categoriaId","areaCompentenzaId")
);

-- CreateTable
CREATE TABLE "Pietanza" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "etichetta" TEXT,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "Pietanza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "dataNascita" TIMESTAMP(3),
    "consenso" BOOLEAN NOT NULL DEFAULT false,
    "ristoranteId" INTEGER NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prenotazione" (
    "id" SERIAL NOT NULL,
    "copertiAdulti" INTEGER NOT NULL,
    "copertiBambini" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "allergie" TEXT,
    "numeroPasseggini" INTEGER,
    "numeroSeggiolini" INTEGER,
    "occasioneVisita" TEXT,
    "clienteId" INTEGER NOT NULL,
    "tavoloId" INTEGER NOT NULL,

    CONSTRAINT "Prenotazione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tavolo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "capienza" INTEGER NOT NULL,
    "ristoranteId" INTEGER NOT NULL,

    CONSTRAINT "Tavolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrarioDiApertura" (
    "id" SERIAL NOT NULL,
    "giorno" "Giorno" NOT NULL,
    "orario" TIMESTAMP(3)[],
    "ristoranteId" INTEGER,

    CONSTRAINT "OrarioDiApertura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ristorante_userId_key" ON "Ristorante"("userId");

-- AddForeignKey
ALTER TABLE "Ristorante" ADD CONSTRAINT "Ristorante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCompentenza" ADD CONSTRAINT "AreaCompentenza_ristoranteId_fkey" FOREIGN KEY ("ristoranteId") REFERENCES "Ristorante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateogorieOnAree" ADD CONSTRAINT "CateogorieOnAree_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateogorieOnAree" ADD CONSTRAINT "CateogorieOnAree_areaCompentenzaId_fkey" FOREIGN KEY ("areaCompentenzaId") REFERENCES "AreaCompentenza"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pietanza" ADD CONSTRAINT "Pietanza_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_ristoranteId_fkey" FOREIGN KEY ("ristoranteId") REFERENCES "Ristorante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_tavoloId_fkey" FOREIGN KEY ("tavoloId") REFERENCES "Tavolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tavolo" ADD CONSTRAINT "Tavolo_ristoranteId_fkey" FOREIGN KEY ("ristoranteId") REFERENCES "Ristorante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrarioDiApertura" ADD CONSTRAINT "OrarioDiApertura_ristoranteId_fkey" FOREIGN KEY ("ristoranteId") REFERENCES "Ristorante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
