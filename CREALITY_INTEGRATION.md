# 🖨️ Guía: Integración Creality Cloud + Seguridad

## Pregunta: ¿Cómo conectar Creality Cloud?

### **Opción 1: Creality Cloud API (Recomendado - Más seguro)**

Creality ofrece una API para obtener estado de impresión en tiempo real.

#### Requisitos:
1. Cuenta Creality Cloud
2. API Key (obtén en https://cloud.creality.com)
3. Device ID de cada impresora

#### Paso 1: Obtener API Key

```
1. Ve a https://cloud.creality.com
2. Inicia sesión
3. Vé a Settings → API Keys
4. Copia tu API Key
```

#### Paso 2: Guardar credenciales de forma segura

```env
# .env.local
CREALITY_API_KEY="tu_api_key_aqui"
CREALITY_API_URL="https://api.creality.com/v1"
```

⚠️ **IMPORTANTE:** Nunca versionear `.env.local`. Usar `.env.example`

#### Paso 3: Extender modelo PrintJob

```typescript
// prisma/schema.prisma

model PrintJob {
  // ... campos existentes ...
  
  // Nuevo: Campos para Creality Cloud
  creality_job_id    String?      // ID de la tarea en Creality
  progress           Int?         // 0-100%
  current_temperature Float?      // Temperatura actual del hot-end
  target_temperature Float?       // Temperatura objetivo
  bed_temperature    Float?       // Temperatura cama
  remaining_time     Int?         // Segundos restantes
  last_status_update DateTime?    // Última actualización
}
```

#### Paso 4: Crear servicio de sincronización

```typescript
// lib/creality.ts

import axios from "axios"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const CREALITY_API_KEY = process.env.CREALITY_API_KEY
const CREALITY_API_URL = process.env.CREALITY_API_URL

export interface CrealityJobStatus {
  id: string
  progress: number
  state: "printing" | "paused" | "completed" | "failed"
  temperature: number
  target_temperature: number
  remaining_time: number
}

/**
 * Obtener estado de una tarea en Creality Cloud
 */
export async function getCrealityJobStatus(
  creality_job_id: string
): Promise<CrealityJobStatus | null> {
  try {
    const response = await axios.get(
      `${CREALITY_API_URL}/jobs/${creality_job_id}`,
      {
        headers: {
          Authorization: `Bearer ${CREALITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error) {
    console.error("Error obteniendo estado Creality:", error)
    return null
  }
}

/**
 * Sincronizar estado de todas las tareas activas con Creality Cloud
 * (Llamar cada 30 segundos o bajo demanda)
 */
export async function syncPrintJobsWithCreality() {
  try {
    // Obtener tareas activas
    const activePrintJobs = await prisma.printJob.findMany({
      where: {
        status: "printing",
        creality_job_id: { not: null },
      },
    })

    console.log(`Sincronizando ${activePrintJobs.length} trabajos con Creality...`)

    for (const job of activePrintJobs) {
      if (!job.creality_job_id) continue

      // Obtener estado actual de Creality
      const status = await getCrealityJobStatus(job.creality_job_id)

      if (status) {
        // Actualizar en nuestra BD
        await prisma.printJob.update({
          where: { id: job.id },
          data: {
            progress: status.progress,
            current_temperature: status.temperature,
            target_temperature: status.target_temperature,
            remaining_time: status.remaining_time,
            last_status_update: new Date(),
            // Actualizar estado si cambió
            status:
              status.state === "printing"
                ? "printing"
                : status.state === "completed"
                ? "completed"
                : status.state === "failed"
                ? "failed"
                : "paused",
          },
        })
      }
    }

    console.log("✅ Sincronización completada")
  } catch (error) {
    console.error("Error en sincronización:", error)
  }
}
```

#### Paso 5: Crear endpoint para obtener estado

```typescript
// app/api/printjobs/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateSession } from "@/lib/auth"
import { getCrealityJobStatus } from "@/lib/creality"
import { withCORS } from "@/lib/middleware"

const prisma = new PrismaClient()

async function requireAuth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) {
    return {
      error: true,
      response: withCORS(
        NextResponse.json(
          { error: "No autorizado - Token requerido" },
          { status: 401 }
        )
      ),
    }
  }
  const user = await validateSession(token)
  if (!user) {
    return {
      error: true,
      response: withCORS(
        NextResponse.json(
          { error: "Token inválido o expirado" },
          { status: 401 }
        )
      ),
    }
  }
  return { error: false, user }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const printJob = await prisma.printJob.findUnique({
      where: { id: params.id },
      include: {
        printer: true,
        piece: { include: { material: true } },
      },
    })

    if (!printJob) {
      return withCORS(
        NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
      )
    }

    // Si está en Creality, obtener datos en tiempo real
    let creality_status = null
    if (printJob.creality_job_id && printJob.status === "printing") {
      creality_status = await getCrealityJobStatus(printJob.creality_job_id)
    }

    return withCORS(
      NextResponse.json({
        ...printJob,
        creality_realtime: creality_status, // Estado en tiempo real
      })
    )
  } catch (error) {
    console.error("Error fetching status:", error)
    return withCORS(
      NextResponse.json(
        { error: "Error obteniendo estado" },
        { status: 500 }
      )
    )
  }
}
```

#### Paso 6: Mostrar progreso en Dashboard

```typescript
// components/PrintJobCard.tsx

export function PrintJobCard({ job }: { job: PrintJob }) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{job.name}</h3>
      
      {/* Barra de progreso */}
      <div className="mt-2">
        <div className="flex justify-between mb-1">
          <span>Progreso</span>
          <span className="font-bold">{job.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Temperatura */}
      {job.current_temperature && (
        <div className="mt-2 text-sm">
          <p>🌡️ Temperatura: {job.current_temperature}°C</p>
          <p>⏱️ Tiempo restante: {Math.round(job.remaining_time / 60)} min</p>
        </div>
      )}

      {/* Estado */}
      <div className="mt-2">
        <span
          className={`px-2 py-1 rounded text-sm ${
            job.status === "printing"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100"
          }`}
        >
          {job.status}
        </span>
      </div>
    </div>
  )
}
```

---

## 🔐 RIESGOS DE SEGURIDAD CON CREALITY CLOUD

### ❌ Riesgo 1: API Key Expuesta

**Problema:**
```typescript
// ❌ NUNCA hacer esto
const response = await fetch(
  `https://api.creality.com/jobs?apiKey=${API_KEY}`
)
// El API key se ve en logs, URLs, etc.
```

**Solución:**
```typescript
// ✅ Usar headers seguros
const response = await axios.get(
  `https://api.creality.com/v1/jobs/${id}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.CREALITY_API_KEY}`,
    },
  }
)
// API key está en headers seguros
```

### ❌ Riesgo 2: Inyección de ID

**Problema:**
```typescript
// ❌ ID del usuario se puede manipular
const jobId = request.query.jobId // "123' OR '1'='1"
await prisma.printJob.findUnique({
  where: { id: jobId }, // ¡Vulnerable!
})
```

**Solución:**
```typescript
// ✅ Validar el ID
const jobId = params.id
// Prisma ORM valida automáticamente

// O validar manualmente
if (!jobId || !/^[a-z0-9]{25}$/.test(jobId)) {
  return NextResponse.json(
    { error: "ID inválido" },
    { status: 400 }
  )
}
```

### ❌ Riesgo 3: Acceso a trabajos de otros usuarios

**Problema:**
```typescript
// ❌ Obtener cualquier trabajo sin validar propiedad
const job = await prisma.printJob.findUnique({
  where: { id: jobId }
})
// El usuario A podría obtener trabajos del usuario B
```

**Solución:**
```typescript
// ✅ Validar que el trabajo pertenece al usuario
const job = await prisma.printJob.findUnique({
  where: { id: jobId },
  include: { order: { include: { client: true } } },
})

// Validar que el usuario tiene acceso
if (auth.user.role !== "admin" && job.order.client.id !== auth.user.id) {
  return NextResponse.json(
    { error: "Acceso denegado" },
    { status: 403 }
  )
}
```

### ❌ Riesgo 4: Rate Limiting en Creality

**Problema:**
```
Creality tiene límites:
- 100 requests/minuto
- Sin protección = DDoS contra Creality
```

**Solución:**
```typescript
// ✅ Cachear datos localmente
const SYNC_INTERVAL = 30000 // 30 segundos

export async function syncPrintJobsWithCreality() {
  // No sincronizar cada request, hacerlo cada X segundos
  const lastUpdate = job.last_status_update
  
  if (
    lastUpdate &&
    Date.now() - lastUpdate.getTime() < SYNC_INTERVAL
  ) {
    // Usar datos en caché
    return job
  }

  // Solo actualizar si pasaron 30 segundos
  const status = await getCrealityJobStatus(job.creality_job_id)
  // ...
}
```

### ❌ Riesgo 5: Credenciales hardcodeadas

**Problema:**
```typescript
// ❌ NUNCA hacer esto
const API_KEY = "sk-abc123def456"
```

**Solución:**
```typescript
// ✅ Usar variables de entorno
const API_KEY = process.env.CREALITY_API_KEY

// En producción: AWS Secrets Manager, Vault, etc.
```

---

## ✅ CHECKLIST: Antes de conectar a Creality Cloud

- [ ] API Key guardado en `.env.local` (no versionado)
- [ ] Todos los endpoints de Creality usan HTTPS
- [ ] Se valida el Authorization header
- [ ] Se valida la propiedad de cada trabajo
- [ ] Se implementó rate limiting local
- [ ] Se cachean los datos (no cada request)
- [ ] Se registran intentos de acceso a Creality
- [ ] La BD tiene copia de seguridad
- [ ] Se usa bcrypt para autenticación
- [ ] Se implementó token expiration

---

## 📊 Diagrama de flujo: Sincronización con Creality

```
┌─────────────────────────────────────────┐
│ Dashboard muestra lista de Print Jobs   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Usuario hace GET /api/printjobs/:id     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Validar token de autenticación          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Obtener job de BD local                 │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    ¿Creality?          ¿Es admin o
     ¿Printing?          propietario?
         │                    │
    YES  │            YES     │
        ▼                     ▼
┌─────────────────────────────────────────┐
│ ¿Pasaron >30s desde último update?      │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    YES  ▼                NO  ▼
┌──────────────────┐  ┌──────────────┐
│ Llamar API de    │  │ Usar datos   │
│ Creality Cloud   │  │ en caché     │
└────────┬─────────┘  └──────┬───────┘
         │                   │
         │    ┌──────────────┘
         ▼    ▼
┌─────────────────────────────────────────┐
│ Actualizar BD con nuevo progreso        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar JSON con:                      │
│ - progress (0-100)                      │
│ - temperature                           │
│ - remaining_time                        │
└─────────────────────────────────────────┘
```

---

## 🚀 Próximos pasos:

1. **Obtener API Key** de Creality Cloud
2. **Proteger todos los endpoints** primero
3. **Implementar Rate Limiting**
4. **Agregar campos a PrintJob**
5. **Crear servicio de sincronización**
6. **Testing local**
7. **Deploy a producción con HTTPS**

---

¿Tienes problemas para conectar a Creality? Revisa el `SECURITY_REPORT.md` para más contexto.
