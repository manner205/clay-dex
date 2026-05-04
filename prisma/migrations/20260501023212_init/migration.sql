-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "dex_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photo_url" TEXT,
    "description" TEXT,
    "hp" INTEGER,
    "attack" INTEGER,
    "attributes" TEXT[],
    "race" TEXT,
    "bonus_effects" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "characters_dex_number_key" ON "characters"("dex_number");
