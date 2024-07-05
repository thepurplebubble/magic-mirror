-- CreateTable
CREATE TABLE "Message" (
    "user" TEXT NOT NULL,
    "originTs" TEXT NOT NULL PRIMARY KEY,
    "originTeam" TEXT NOT NULL,
    "originChannel" TEXT NOT NULL,
    "originThreadTs" TEXT,
    "mirrorTs" TEXT NOT NULL,
    "mirrorTeam" TEXT NOT NULL,
    "mirrorChannel" TEXT NOT NULL,
    "mirrorThreadTs" TEXT,
    "text" TEXT,
    "blocks" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_originTs_key" ON "Message"("originTs");

-- CreateIndex
CREATE UNIQUE INDEX "Message_mirrorTs_key" ON "Message"("mirrorTs");
