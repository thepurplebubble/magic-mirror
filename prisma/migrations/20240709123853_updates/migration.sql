/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blocks` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mirrorChannel` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mirrorTeam` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mirrorThreadTs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mirrorTs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `originChannel` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `originTeam` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `originThreadTs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `originTs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - Added the required column `hcChannel` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hcTs` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pbChannel` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pbTs` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setting" TEXT NOT NULL,
    "value" TEXT,
    "boolean" BOOLEAN
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "newThreads" INTEGER NOT NULL,
    "totalSyncedMessages" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "user" TEXT NOT NULL,
    "hcTs" TEXT NOT NULL PRIMARY KEY,
    "hcChannel" TEXT NOT NULL,
    "pbTs" TEXT NOT NULL,
    "pbChannel" TEXT NOT NULL
);
INSERT INTO "new_Message" ("user") SELECT "user" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_hcTs_key" ON "Message"("hcTs");
CREATE UNIQUE INDEX "Message_pbTs_key" ON "Message"("pbTs");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_setting_key" ON "Settings"("setting");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_day_key" ON "Analytics"("day");
