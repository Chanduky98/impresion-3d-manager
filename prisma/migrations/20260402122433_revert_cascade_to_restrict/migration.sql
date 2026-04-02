-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("createdAt", "id", "orderId", "pieceId", "quantity", "unitCost", "unitPrice", "updatedAt") SELECT "createdAt", "id", "orderId", "pieceId", "quantity", "unitCost", "unitPrice", "updatedAt" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_pieceId_idx" ON "OrderItem"("pieceId");
CREATE TABLE "new_PrintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "printerId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "estimatedEndTime" DATETIME,
    "actualDuration" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrintJob" ("actualDuration", "createdAt", "endTime", "estimatedEndTime", "filePath", "id", "name", "notes", "pieceId", "printerId", "quantity", "startTime", "status", "success", "updatedAt") SELECT "actualDuration", "createdAt", "endTime", "estimatedEndTime", "filePath", "id", "name", "notes", "pieceId", "printerId", "quantity", "startTime", "status", "success", "updatedAt" FROM "PrintJob";
DROP TABLE "PrintJob";
ALTER TABLE "new_PrintJob" RENAME TO "PrintJob";
CREATE INDEX "PrintJob_status_idx" ON "PrintJob"("status");
CREATE INDEX "PrintJob_printerId_idx" ON "PrintJob"("printerId");
CREATE INDEX "PrintJob_pieceId_idx" ON "PrintJob"("pieceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
