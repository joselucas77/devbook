/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_githubId_key" ON "Users"("githubId");
