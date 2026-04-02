require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos existentes
  await prisma.usageLog.deleteMany({});
  await prisma.maintenance.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.printJob.deleteMany({});
  await prisma.piece.deleteMany({});
  await prisma.printer.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.settings.deleteMany({});

  // Settings
  const settings = await prisma.settings.create({
    data: {
      electricityCostPerKwh: 0.25,
      currencySymbol: "€",
      defaultMarginPercent: 30,
    },
  });
  console.log("✓ Settings creados");

  // Clientes
  const client1 = await prisma.client.create({
    data: {
      name: "Empresa ABC S.L.",
      email: "info@abc.com",
      phone: "+34 912345678",
      address: "Calle Principal 123",
      city: "Madrid",
      zipCode: "28001",
      country: "España",
      notes: "Cliente frecuente, buena relación",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Tienda de Juguetes XYZ",
      email: "contacto@xyz.com",
      phone: "+34 987654321",
      address: "Av. Central 456",
      city: "Barcelona",
      zipCode: "08002",
      country: "España",
      notes: "Pedidos ocasionales",
    },
  });

  console.log("✓ Clientes creados");

  // Impresoras
  const printer1 = await prisma.printer.create({
    data: {
      name: "Creality Ender 3 Pro",
      model: "Ender 3 Pro",
      manufacturer: "Creality",
      serialNumber: "SN001",
      printAreaX: 220,
      printAreaY: 220,
      printAreaZ: 250,
      nozzleTemperature: 200,
      bedTemperature: 60,
      powerConsumption: 350,
      purchaseDate: new Date("2023-01-15"),
      purchaseCost: 250,
      status: "active",
      notes: "Impresora principal para producciones de PLA",
    },
  });

  const printer2 = await prisma.printer.create({
    data: {
      name: "Formlabs Form 3",
      model: "Form 3",
      manufacturer: "Formlabs",
      serialNumber: "SN002",
      printAreaX: 145,
      printAreaY: 145,
      printAreaZ: 185,
      nozzleTemperature: 0,
      bedTemperature: 0,
      powerConsumption: 200,
      purchaseDate: new Date("2023-06-20"),
      purchaseCost: 3500,
      status: "active",
      notes: "Impresora de resina para piezas de precisión",
    },
  });

  console.log("✓ Impresoras creadas");

  // Materiales
  const pla = await prisma.material.create({
    data: {
      name: "PLA Blanco",
      type: "PLA",
      color: "Blanco",
      supplier: "Amazon Basics",
      costPerKg: 15,
      density: 1.24,
      temperatureMin: 190,
      temperatureMax: 220,
      printSpeed: 50,
      bedTemperature: 50,
      notes: "Material estándar, buena calidad",
    },
  });

  const petg = await prisma.material.create({
    data: {
      name: "PETG Negro",
      type: "PETG",
      color: "Negro",
      supplier: "Prusament",
      costPerKg: 22,
      density: 1.27,
      temperatureMin: 220,
      temperatureMax: 250,
      printSpeed: 40,
      bedTemperature: 70,
      notes: "Material resistente, ideal para piezas funcionales",
    },
  });

  const resin = await prisma.material.create({
    data: {
      name: "Clear Resin",
      type: "Resina",
      color: "Transparente",
      supplier: "Formlabs",
      costPerKg: 50,
      density: 1.15,
      temperatureMin: 0,
      temperatureMax: 0,
      printSpeed: 25,
      bedTemperature: 0,
      notes: "Resina para impresora Form 3",
    },
  });

  console.log("✓ Materiales creados");

  // Piezas
  const piece1 = await prisma.piece.create({
    data: {
      name: "Soporte de teléfono",
      description: "Soporte ajustable para teléfono móvil",
      fileName: "phone_holder.stl",
      fileSize: 2.5,
      weight: 25,
      estimatedTime: 80,
      materialId: pla.id,
    },
  });

  const piece2 = await prisma.piece.create({
    data: {
      name: "Engranaje de enganche",
      description: "Engranaje funcional para mecanismo",
      fileName: "gear_20mm.stl",
      fileSize: 1.2,
      weight: 18,
      estimatedTime: 60,
      materialId: petg.id,
    },
  });

  const piece3 = await prisma.piece.create({
    data: {
      name: "Figura de joyería",
      description: "Pequeña figura decorativa de precisión",
      fileName: "jewelry_figurine.stl",
      fileSize: 0.8,
      weight: 5,
      estimatedTime: 30,
      materialId: resin.id,
    },
  });

  console.log("✓ Piezas creadas");

  // Órdenes
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-001",
      clientId: client1.id,
      status: "in_progress",
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      marginPercent: 35,
      notes: "Entrega a domicilio, pedir confirmación",
      items: {
        create: [
          {
            pieceId: piece1.id,
            quantity: 5,
            unitCost: 6.25,
            unitPrice: 9.99,
          },
          {
            pieceId: piece2.id,
            quantity: 2,
            unitCost: 5.4,
            unitPrice: 7.99,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Calcular totales de la orden
  let itemsTotalCost = 0;
  let itemsTotalPrice = 0;
  for (const item of order1.items) {
    itemsTotalCost += item.unitCost * item.quantity;
    itemsTotalPrice += item.unitPrice * item.quantity;
  }

  await prisma.order.update({
    where: { id: order1.id },
    data: {
      totalCost: itemsTotalCost,
      totalPrice: itemsTotalPrice,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-002",
      clientId: client2.id,
      status: "pending",
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      marginPercent: 30,
      notes: "Presupuesto aprobado",
      items: {
        create: [
          {
            pieceId: piece3.id,
            quantity: 10,
            unitCost: 2.75,
            unitPrice: 3.99,
          },
        ],
      },
    },
    include: { items: true },
  });

  let items2TotalCost = 0;
  let items2TotalPrice = 0;
  for (const item of order2.items) {
    items2TotalCost += item.unitCost * item.quantity;
    items2TotalPrice += item.unitPrice * item.quantity;
  }

  await prisma.order.update({
    where: { id: order2.id },
    data: {
      totalCost: items2TotalCost,
      totalPrice: items2TotalPrice,
    },
  });

  console.log("✓ Órdenes creadas");

  // Trabajos de impresión
  const job1 = await prisma.printJob.create({
    data: {
      name: "Job - Soportes teléfono ORD-001",
      status: "completed",
      printerId: printer1.id,
      pieceId: piece1.id,
      quantity: 5,
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4800 * 1000),
      actualDuration: 4800,
      success: true,
      notes: "Impresión exitosa sin problemas",
    },
  });

  const job2 = await prisma.printJob.create({
    data: {
      name: "Job - Engranajes ORD-001",
      status: "printing",
      printerId: printer1.id,
      pieceId: piece2.id,
      quantity: 2,
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 3600 * 1000),
      success: false,
      notes: "En proceso",
    },
  });

  console.log("✓ Trabajos de impresión creados");

  // Mantenimientos
  const maintenance1 = await prisma.maintenance.create({
    data: {
      printerId: printer1.id,
      type: "calibration",
      description: "Calibración de cama y nivelación",
      cost: 0,
      status: "completed",
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: "Calibración manual, sin partes nuevas",
    },
  });

  const maintenance2 = await prisma.maintenance.create({
    data: {
      printerId: printer1.id,
      type: "cleaning",
      description: "Limpieza de boquilla y cámara",
      cost: 0,
      status: "pending",
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: "Mantenimiento preventivo programado",
    },
  });

  const maintenance3 = await prisma.maintenance.create({
    data: {
      printerId: printer2.id,
      type: "nozzle_replacement",
      description: "Reemplazo de boquilla de tungsteno",
      cost: 120,
      status: "pending",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: "Pieza desgastada, necesita cambio urgente",
    },
  });

  console.log("✓ Mantenimientos creados");

  // Usage Logs
  await prisma.usageLog.create({
    data: {
      printerId: printer1.id,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5400 * 1000),
      duration: 5400,
      notes: "Impresión normal",
    },
  });

  await prisma.usageLog.create({
    data: {
      printerId: printer2.id,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2700 * 1000),
      duration: 2700,
      notes: "Impresión de figuras pequeñas",
    },
  });

  console.log("✓ Usage logs creados");

  console.log("✅ Seed completado exitosamente");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
