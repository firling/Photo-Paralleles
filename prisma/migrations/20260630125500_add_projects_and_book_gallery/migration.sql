/*
  Warnings:

  - Made the column `bio` on table `Artist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Book` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "bio" SET NOT NULL;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "gallery" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "cover" TEXT NOT NULL,
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
