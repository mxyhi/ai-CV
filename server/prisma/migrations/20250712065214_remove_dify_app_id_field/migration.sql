/*
  Warnings:

  - You are about to drop the column `difyAppId` on the `bots` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "difyApiKey" TEXT NOT NULL,
    "difyBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost/v1',
    "category" TEXT NOT NULL DEFAULT 'CUSTOMER_SERVICE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessage" TEXT,
    "fallbackMessage" TEXT,
    "maxTokens" INTEGER DEFAULT 1000,
    "temperature" REAL DEFAULT 0.7,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bots_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bots" ("avatar", "category", "createdAt", "createdBy", "description", "difyApiKey", "difyBaseUrl", "fallbackMessage", "id", "isActive", "isPublic", "maxTokens", "name", "temperature", "updatedAt", "welcomeMessage") SELECT "avatar", "category", "createdAt", "createdBy", "description", "difyApiKey", "difyBaseUrl", "fallbackMessage", "id", "isActive", "isPublic", "maxTokens", "name", "temperature", "updatedAt", "welcomeMessage" FROM "bots";
DROP TABLE "bots";
ALTER TABLE "new_bots" RENAME TO "bots";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
