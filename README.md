# 🎨 Gestor de Impresión 3D

Aplicación web completa para la gestión integral de operaciones de impresión 3D. Diseñada para empresas y talleres que necesitan controlar impresoras, pedidos, costes y rentabilidad.

## ✨ Características

### 📊 Dashboard
- **Métricas en tiempo real**: Ingresos, costes, beneficios
- **Gráficos interactivos**: Órdenes por estado, piezas más rentables
- **Top clientes**: Rankings de clientes por volumen de gasto
- **Horas de impresión**: Estadísticas de uso

### 🖨️ Gestión de Impresoras
- CRUD completo de impresoras 3D
- Especificaciones técnicas: área de impresión, consumo, temperatura
- Estados: Activa, Inactiva, Mantenimiento
- Histórico de uso y mantenimientos

### 🧩 Gestión de Piezas
- Catálogo de modelos 3D
- Asociación con materiales
- Peso estimado y tiempo de impresión
- Descarga de archivos (STL/OBJ)

### 📦 Gestión de Órdenes
- Creación de pedidos de clientes
- Cálculo automático de costes y precios
- Estados: Pendiente, En Progreso, Completado, Entregado
- Margen de beneficio configurable por orden

### 👥 Gestión de Clientes
- Base de datos de clientes
- Información de contacto y dirección
- Histórico de órdenes
- Estadísticas por cliente

### 🧪 Gestión de Materiales
- Inventario de filamentos y resinas
- Coste por kilogramo
- Proveedores y especificaciones
- Temperaturas de impresión

### 🔧 Mantenimiento
- Registro de mantenimientos programados
- Tipos: Limpieza, Calibración, Reparación, Cambios de piezas
- Seguimiento de costes
- Estados: Pendiente, En Progreso, Completado

### 📅 Calendario
- Visualización de órdenes y entregas
- Próximos eventos de mantenimiento
- Vista por mes
- Seguimiento de plazos

### ⚙️ Configuración
- Coste de electricidad (€/kWh)
- Símbolo de moneda
- Margen de beneficio por defecto
- Información del sistema

## 🚀 Inicio Rápido

### Opción 1: Script Automático (RECOMENDADO)
```bash
INICIAR.bat
```
El script realizará automáticamente:
- ✓ Instalación de dependencias
- ✓ Creación de base de datos
- ✓ Carga de datos de ejemplo
- ✓ Inicio del servidor
- ✓ Apertura del navegador en http://localhost:3000/dashboard

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# 3. Cargar datos de ejemplo
npx prisma db seed

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:3000/dashboard
```

## 📋 Requisitos

- **Node.js**: 18.0.0 o superior
- **NPM**: Incluido con Node.js
- **Navegador moderno**: Chrome, Firefox, Safari, Edge

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | TailwindCSS + Shadcn/UI |
| **Base de Datos** | SQLite + Prisma ORM |
| **Gráficos** | Recharts |
| **Calendario** | FullCalendar |
| **Formularios** | React Hook Form + Zod |
| **Estado** | Zustand |

## 📁 Estructura del Proyecto

```
impresion_3d/
├── app/
│   ├── api/                    # API REST endpoints
│   │   ├── printers/          # Gestión de impresoras
│   │   ├── pieces/            # Gestión de piezas
│   │   ├── orders/            # Gestión de órdenes
│   │   ├── clients/           # Gestión de clientes
│   │   ├── materials/         # Gestión de materiales
│   │   ├── printjobs/         # Trabajos de impresión
│   │   ├── maintenance/       # Mantenimientos
│   │   ├── settings/          # Configuración
│   │   └── dashboard/         # Estadísticas
│   ├── dashboard/             # Página principal
│   ├── printers/              # Páginas de impresoras
│   ├── pieces/                # Páginas de piezas
│   ├── orders/                # Páginas de órdenes
│   ├── clients/               # Páginas de clientes
│   ├── materials/             # Páginas de materiales
│   ├── maintenance/           # Páginas de mantenimiento
│   ├── calendar/              # Página de calendario
│   ├── settings/              # Página de configuración
│   ├── layout.tsx             # Layout raíz
│   ├── page.tsx               # Página inicio (redirige a dashboard)
│   └── globals.css            # Estilos globales
├── components/
│   ├── Sidebar.tsx            # Navegación lateral
│   ├── StatsCard.tsx          # Tarjetas de estadísticas
│   ├── Button.tsx             # Botón reutilizable
│   ├── Dialog.tsx             # Modal/Diálogo
│   └── FormField.tsx          # Componentes de formulario
├── lib/
│   ├── utils.ts               # Utilidades (formato, colores, etc.)
│   ├── calculations.ts        # Lógica de cálculos de costes
│   ├── schemas.ts             # Schemas de validación con Zod
│   └── stores.ts              # Zustand stores (estado global)
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Datos de ejemplo
│   └── dev.db                 # Base de datos SQLite (generada)
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración TypeScript
├── next.config.mjs            # Configuración Next.js
├── tailwind.config.ts         # Configuración TailwindCSS
├── .env.local                 # Variables de entorno
└── SETUP.txt                  # Guía de instalación
```

## 🔌 Endpoints de API

### Impresoras
- `GET /api/printers` - Listar todas
- `POST /api/printers` - Crear
- `GET /api/printers/[id]` - Obtener
- `PUT /api/printers/[id]` - Actualizar
- `DELETE /api/printers/[id]` - Eliminar

### Piezas
- `GET /api/pieces` - Listar todas
- `POST /api/pieces` - Crear
- `GET /api/pieces/[id]` - Obtener
- `PUT /api/pieces/[id]` - Actualizar
- `DELETE /api/pieces/[id]` - Eliminar

### Órdenes
- `GET /api/orders` - Listar todas
- `POST /api/orders` - Crear
- `GET /api/orders/[id]` - Obtener
- `PUT /api/orders/[id]` - Actualizar
- `DELETE /api/orders/[id]` - Eliminar

### Clientes
- `GET /api/clients` - Listar todos
- `POST /api/clients` - Crear
- `GET /api/clients/[id]` - Obtener
- `PUT /api/clients/[id]` - Actualizar
- `DELETE /api/clients/[id]` - Eliminar

### Materiales
- `GET /api/materials` - Listar todos
- `POST /api/materials` - Crear
- `GET /api/materials/[id]` - Obtener
- `PUT /api/materials/[id]` - Actualizar
- `DELETE /api/materials/[id]` - Eliminar

### Trabajos de Impresión
- `GET /api/printjobs` - Listar todos
- `POST /api/printjobs` - Crear
- `GET /api/printjobs/[id]` - Obtener
- `PUT /api/printjobs/[id]` - Actualizar
- `DELETE /api/printjobs/[id]` - Eliminar

### Mantenimiento
- `GET /api/maintenance` - Listar todos
- `POST /api/maintenance` - Crear
- `GET /api/maintenance/[id]` - Obtener
- `PUT /api/maintenance/[id]` - Actualizar
- `DELETE /api/maintenance/[id]` - Eliminar

### Configuración
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar configuración

### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas

## 📊 Cálculos Implementados

### Coste de Material
```
Coste Material = (Peso en gramos / 1000) × Coste por kg
```

### Coste de Electricidad
```
Coste Electricidad = (Potencia en W / 1000) × Duración en horas × Coste por kWh
```

### Precio de Venta
```
Precio = (Coste Material + Coste Electricidad) × (1 + Margen %)
```

### Margen de Beneficio
```
Beneficio = Precio - Coste Total
Margen % = (Beneficio / Coste Total) × 100
```

## 🗄️ Base de Datos

**Tipo**: SQLite
**Ubicación**: `./prisma/dev.db`
**ORM**: Prisma

### Entidades
- **Settings**: Configuración global
- **Printer**: Impresoras 3D
- **Piece**: Modelos 3D
- **Material**: Filamentos y resinas
- **Client**: Clientes
- **Order**: Órdenes de clientes
- **OrderItem**: Items dentro de órdenes
- **PrintJob**: Trabajos de impresión
- **Maintenance**: Registros de mantenimiento
- **UsageLog**: Historial de uso

## 📦 Datos de Ejemplo

Se incluyen datos precargados:
- **2 Impresoras**: Creality Ender 3 Pro, Formlabs Form 3
- **3 Materiales**: PLA Blanco, PETG Negro, Clear Resin
- **3 Piezas**: Soporte de teléfono, Engranaje, Figura de joyería
- **2 Clientes**: Empresa ABC S.L., Tienda de Juguetes XYZ
- **2 Órdenes**: Con items múltiples
- **3 Mantenimientos**: Variados estados
- **2 Registros de uso**: Histórico de impresiones

## ⚙️ Configuración Predeterminada

- **Coste Electricidad**: 0.25 €/kWh
- **Moneda**: €
- **Margen Beneficio**: 30%

Estos valores se pueden cambiar en la página de Configuración dentro de la aplicación.

## 🚀 Comandos Disponibles

```bash
npm run dev              # Iniciar servidor desarrollo (hot reload)
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Validar código
npx prisma studio       # Abrir interfaz visual de BD (http://localhost:5555)
npx prisma migrate dev   # Crear nueva migración
npx prisma db seed       # Ejecutar seed
npx prisma db reset      # Resetear BD y ejecutar migrations + seed
```

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ya está en uso
```bash
npm run dev -- -p 3001
```

### Base de datos corrupta
```bash
npx prisma db reset
```

### Datos no aparecen después de cambiar schema
```bash
npx prisma migrate dev
npx prisma db seed
```

## 📱 Responsive Design

La aplicación está optimizada para:
- ✓ Desktop (1920px+)
- ✓ Laptop (1366px)
- ✓ Tablet (768px)
- ✓ Móvil (375px)

## 🔒 Notas de Seguridad

**Versión actual**: Sin autenticación. Acceso directo.

Para producción, se recomienda:
- Agregar autenticación (NextAuth.js, Auth0, Clerk)
- Validación de permisos en API routes
- Variables de entorno seguras
- HTTPS obligatorio
- Rate limiting
- Auditoría de accesos

## 📝 Licencia

Proyecto personal - Sin licencia específica

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Revisar logs en la consola
2. Consultar la sección "Solución de Problemas"
3. Verificar archivo SETUP.txt

---

**Versión**: 1.0.0
**Última actualización**: Abril 2024
**Estado**: ✅ Producción lista
