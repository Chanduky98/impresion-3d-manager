-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Piece" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT,
    "fileSize" REAL,
    "weight" REAL NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "materialId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "customSellingPrice" REAL,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Piece_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Piece" ("createdAt", "customSellingPrice", "description", "estimatedTime", "fileName", "fileSize", "id", "materialId", "name", "status", "updatedAt", "weight") SELECT "createdAt", "customSellingPrice", "description", "estimatedTime", "fileName", "fileSize", "id", "materialId", "name", "status", "updatedAt", "weight" FROM "Piece";
DROP TABLE "Piece";
ALTER TABLE "new_Piece" RENAME TO "Piece";
CREATE INDEX "Piece_materialId_idx" ON "Piece"("materialId");
CREATE INDEX "Piece_status_idx" ON "Piece"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
