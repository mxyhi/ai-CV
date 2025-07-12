/*
  Warnings:

  - You are about to drop the `bot_knowledge_bases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `knowledge_bases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `fallbackMessage` on the `bots` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `bots` table. All the data in the column will be lost.
  - You are about to drop the column `maxTokens` on the `bots` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `bots` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "bot_knowledge_bases_botId_knowledgeBaseId_key";

-- DropIndex
DROP INDEX "knowledge_bases_difyDatasetId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "bot_knowledge_bases";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "knowledge_bases";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "welcomeMessage" TEXT,
    "difyApiKey" TEXT NOT NULL,
    "difyBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost/v1',
    "category" TEXT NOT NULL DEFAULT 'CUSTOMER_SERVICE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bots_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bots" ("avatar", "category", "createdAt", "createdBy", "description", "difyApiKey", "difyBaseUrl", "id", "isActive", "name", "updatedAt", "welcomeMessage") SELECT "avatar", "category", "createdAt", "createdBy", "description", "difyApiKey", "difyBaseUrl", "id", "isActive", "name", "updatedAt", "welcomeMessage" FROM "bots";
DROP TABLE "bots";
ALTER TABLE "new_bots" RENAME TO "bots";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
