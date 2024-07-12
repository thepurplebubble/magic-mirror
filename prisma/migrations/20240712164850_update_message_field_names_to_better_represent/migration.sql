/*
  Warnings:

  - You are about to drop the column `hcChannel` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `hcTs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `pbChannel` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `pbTs` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originTs]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mirrorTs]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mirrorChannel` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mirrorTeam` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mirrorTs` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originChannel` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originTeam` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originTs` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_hcTs_key";

-- DropIndex
DROP INDEX "Message_pbTs_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "hcChannel",
DROP COLUMN "hcTs",
DROP COLUMN "pbChannel",
DROP COLUMN "pbTs",
ADD COLUMN     "mirrorChannel" TEXT NOT NULL,
ADD COLUMN     "mirrorTeam" TEXT NOT NULL,
ADD COLUMN     "mirrorTs" TEXT NOT NULL,
ADD COLUMN     "originChannel" TEXT NOT NULL,
ADD COLUMN     "originTeam" TEXT NOT NULL,
ADD COLUMN     "originTs" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_originTs_key" ON "Message"("originTs");

-- CreateIndex
CREATE UNIQUE INDEX "Message_mirrorTs_key" ON "Message"("mirrorTs");
