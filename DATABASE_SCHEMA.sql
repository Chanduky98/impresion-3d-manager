-- ====================================================================
-- GESTOR DE IMPRESIÓN 3D - ESQUEMA DE BASE DE DATOS SQLite
-- ====================================================================
--
-- Esta base de datos se genera automáticamente usando Prisma ORM
-- Archivo de BD: ./prisma/dev.db
--
-- NO EJECUTAR ESTE SCRIPT MANUALMENTE
-- Se crea automáticamente con: npx prisma migrate dev
-- ====================================================================

-- Configuración global de la aplicación
CREATE TABLE Settings (
    id TEXT PRIMARY KEY,
    electricityCostPerKwh REAL NOT NULL DEFAULT 0.25,
    currencySymbol TEXT NOT NULL DEFAULT '€',
    defaultMarginPercent REAL NOT NULL DEFAULT 30.0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE Client (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    zipCode TEXT,
    country TEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_name ON Client(name);

-- Impresoras 3D
CREATE TABLE Printer (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    manufacturer TEXT,
    serialNumber TEXT,
    description TEXT,
    printAreaX REAL NOT NULL DEFAULT 200.0,
    printAreaY REAL NOT NULL DEFAULT 200.0,
    printAreaZ REAL NOT NULL DEFAULT 200.0,
    nozzleTemperature INTEGER NOT NULL DEFAULT 200,
    bedTemperature INTEGER NOT NULL DEFAULT 60,
    powerConsumption REAL NOT NULL DEFAULT 300.0,
    purchaseDate DATETIME,
    purchaseCost REAL,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_printer_status ON Printer(status);

-- Materiales (filamentos, resinas, etc)
CREATE TABLE Material (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT,
    supplier TEXT,
    costPerKg REAL NOT NULL,
    density REAL,
    temperatureMin INTEGER,
    temperatureMax INTEGER,
    printSpeed INTEGER,
    bedTemperature INTEGER,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_type ON Material(type);

-- Piezas/Modelos
CREATE TABLE Piece (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    fileName TEXT,
    fileSize REAL,
    weight REAL NOT NULL,
    estimatedTime INTEGER NOT NULL,
    materialId TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materialId) REFERENCES Material(id) ON DELETE CASCADE
);

CREATE INDEX idx_piece_materialId ON Piece(materialId);

-- Trabajos de impresión
CREATE TABLE PrintJob (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    printerId TEXT NOT NULL,
    pieceId TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    startTime DATETIME,
    endTime DATETIME,
    estimatedEndTime DATETIME,
    actualDuration INTEGER,
    success BOOLEAN NOT NULL DEFAULT 0,
    notes TEXT,
    filePath TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printerId) REFERENCES Printer(id) ON DELETE RESTRICT,
    FOREIGN KEY (pieceId) REFERENCES Piece(id) ON DELETE RESTRICT
);

CREATE INDEX idx_printjob_status ON PrintJob(status);
CREATE INDEX idx_printjob_printerId ON PrintJob(printerId);
CREATE INDEX idx_printjob_pieceId ON PrintJob(pieceId);

-- Órdenes/Pedidos de clientes
CREATE TABLE Order (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL UNIQUE,
    clientId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    deliveryDate DATETIME,
    totalCost REAL NOT NULL DEFAULT 0.0,
    totalPrice REAL NOT NULL DEFAULT 0.0,
    marginPercent REAL NOT NULL DEFAULT 30.0,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES Client(id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_status ON Order(status);
CREATE INDEX idx_order_clientId ON Order(clientId);

-- Items de una orden
CREATE TABLE OrderItem (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    pieceId TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unitCost REAL NOT NULL DEFAULT 0.0,
    unitPrice REAL NOT NULL DEFAULT 0.0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES Order(id) ON DELETE CASCADE,
    FOREIGN KEY (pieceId) REFERENCES Piece(id) ON DELETE RESTRICT
);

CREATE INDEX idx_orderitem_orderId ON OrderItem(orderId);
CREATE INDEX idx_orderitem_pieceId ON OrderItem(pieceId);

-- Mantenimientos
CREATE TABLE Maintenance (
    id TEXT PRIMARY KEY,
    printerId TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    cost REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'pending',
    scheduledAt DATETIME,
    completedAt DATETIME,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printerId) REFERENCES Printer(id) ON DELETE CASCADE
);

CREATE INDEX idx_maintenance_printerId ON Maintenance(printerId);
CREATE INDEX idx_maintenance_status ON Maintenance(status);

-- Registro de uso/tiempos
CREATE TABLE UsageLog (
    id TEXT PRIMARY KEY,
    printerId TEXT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    duration INTEGER,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printerId) REFERENCES Printer(id) ON DELETE CASCADE
);

CREATE INDEX idx_usagelog_printerId ON UsageLog(printerId);
CREATE INDEX idx_usagelog_startTime ON UsageLog(startTime);

-- ====================================================================
-- DATOS DE EJEMPLO - Se cargan automáticamente con npm db seed
-- ====================================================================

-- IMPORTANTE: Los datos de ejemplo se cargan mediante el archivo:
-- ./prisma/seed.ts
--
-- Para recargar los datos después de hacer cambios:
-- $ npx prisma db seed

-- ====================================================================
-- INFORMACIÓN DE CONEXIÓN
-- ====================================================================
--
-- Tipo de BD: SQLite
-- Archivo: ./prisma/dev.db
-- Ubicación: Raíz del proyecto
-- Tamaño: Dinámico (comienza ~100KB)
-- Respaldo: Copiar archivo ./prisma/dev.db a lugar seguro
--
-- Para inspeccionar la BD visualmente:
-- $ npx prisma studio
--
-- Esto abrirá una interfaz web en http://localhost:5555

-- ====================================================================
-- ESTADÍSTICAS DE TABLAS (Después de seed)
-- ====================================================================
--
-- Settings: 1 registro
-- Clients: 2 registros
-- Printers: 2 registros
-- Materials: 3 registros
-- Pieces: 3 registros
-- Orders: 2 registros
-- OrderItems: 3 registros
-- PrintJobs: 2 registros
-- Maintenance: 3 registros
-- UsageLog: 2 registros
--
-- Total de registros: ~23 (datos de ejemplo)

-- ====================================================================
