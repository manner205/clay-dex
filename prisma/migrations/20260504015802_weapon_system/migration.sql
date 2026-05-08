/*
  Warnings:

  - You are about to drop the column `dex_number` on the `characters` table. All the data in the column will be lost.
  - The `race` column on the `characters` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "characters_dex_number_key";

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "dex_number",
ADD COLUMN     "dex_numbers" INTEGER[],
DROP COLUMN "race",
ADD COLUMN     "race" TEXT[];

-- CreateTable
CREATE TABLE "weapons" (
    "id" TEXT NOT NULL,
    "dex_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photo_url" TEXT,
    "description" TEXT,
    "hp_bonus" INTEGER NOT NULL DEFAULT 0,
    "attack_bonus" INTEGER NOT NULL DEFAULT 0,
    "attributes" TEXT[],
    "weapon_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_weapons" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "weapon_id" TEXT NOT NULL,
    "slot_position" INTEGER NOT NULL,
    "equipped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy_settings" (
    "id" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "bonus_type" TEXT NOT NULL DEFAULT 'fixed',
    "bonus_value" INTEGER NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synergy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weapons_dex_number_key" ON "weapons"("dex_number");

-- CreateIndex
CREATE UNIQUE INDEX "character_weapons_weapon_id_key" ON "character_weapons"("weapon_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_weapons_character_id_slot_position_key" ON "character_weapons"("character_id", "slot_position");

-- CreateIndex
CREATE UNIQUE INDEX "synergy_settings_attribute_key" ON "synergy_settings"("attribute");

-- AddForeignKey
ALTER TABLE "character_weapons" ADD CONSTRAINT "character_weapons_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_weapons" ADD CONSTRAINT "character_weapons_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
