-- CreateEnum
CREATE TYPE "reactionType" AS ENUM ('REMOVED', 'ADDED');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "hcTs" TEXT NOT NULL,
    "hcChannel" TEXT NOT NULL,
    "pbTs" TEXT NOT NULL,
    "pbChannel" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "type" "reactionType" NOT NULL,
    "user" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "value" TEXT,
    "boolean" BOOLEAN,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "newThreads" INTEGER NOT NULL,
    "totalSyncedMessages" INTEGER NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_hcTs_key" ON "Message"("hcTs");

-- CreateIndex
CREATE UNIQUE INDEX "Message_pbTs_key" ON "Message"("pbTs");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_setting_key" ON "Settings"("setting");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_day_key" ON "Analytics"("day");
