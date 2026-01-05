-- CreateTable
CREATE TABLE "Association" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telephone" TEXT,
    "licenceActive" BOOLEAN NOT NULL DEFAULT true,
    "licenceExpire" TIMESTAMP(3),
    "logo" TEXT,
    "affiche" TEXT,
    "couleurTheme" TEXT NOT NULL DEFAULT '#1e40af',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSalle" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL DEFAULT 'Salle principale',
    "capaciteTotal" INTEGER NOT NULL DEFAULT 100,
    "structure" TEXT NOT NULL,
    "configuration" TEXT NOT NULL DEFAULT 'standard',
    "associationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representation" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL DEFAULT 'Représentation',
    "date" TIMESTAMP(3) NOT NULL,
    "heure" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "description" TEXT,
    "placesOccupees" TEXT NOT NULL DEFAULT '[]',
    "placesPmr" TEXT NOT NULL DEFAULT '[]',
    "statut" TEXT NOT NULL DEFAULT 'planifie',
    "associationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Representation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "nbPlaces" INTEGER NOT NULL,
    "sieges" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'confirmé',
    "notes" TEXT,
    "representationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Association_slug_key" ON "Association"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Association_email_key" ON "Association"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSalle_associationId_key" ON "PlanSalle"("associationId");

-- AddForeignKey
ALTER TABLE "PlanSalle" ADD CONSTRAINT "PlanSalle_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representation" ADD CONSTRAINT "Representation_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_representationId_fkey" FOREIGN KEY ("representationId") REFERENCES "Representation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
