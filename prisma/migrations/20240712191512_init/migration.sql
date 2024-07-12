-- CreateEnum
CREATE TYPE "reactionType" AS ENUM ('REMOVED', 'ADDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "team" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originTs" TEXT NOT NULL,
    "originChannel" TEXT NOT NULL,
    "originTeam" TEXT NOT NULL,
    "mirrorTs" TEXT NOT NULL,
    "mirrorChannel" TEXT NOT NULL,
    "mirrorTeam" TEXT NOT NULL,
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
    "messageId" TEXT,
    "count" INTEGER NOT NULL,

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
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_key" ON "Message"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_originTs_key" ON "Message"("originTs");

-- CreateIndex
CREATE UNIQUE INDEX "Message_mirrorTs_key" ON "Message"("mirrorTs");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_id_key" ON "Reaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_setting_key" ON "Settings"("setting");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_day_key" ON "Analytics"("day");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
