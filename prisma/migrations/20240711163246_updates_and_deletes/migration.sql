-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "user" TEXT NOT NULL,
    "hcTs" TEXT NOT NULL PRIMARY KEY,
    "hcChannel" TEXT NOT NULL,
    "pbTs" TEXT NOT NULL,
    "pbChannel" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Message" ("hcChannel", "hcTs", "pbChannel", "pbTs", "user") SELECT "hcChannel", "hcTs", "pbChannel", "pbTs", "user" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_hcTs_key" ON "Message"("hcTs");
CREATE UNIQUE INDEX "Message_pbTs_key" ON "Message"("pbTs");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
