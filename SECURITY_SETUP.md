# 🔐 Configuración de Seguridad - Guía Completa

## 1️⃣ CREDENCIALES DE ACCESO INICIAL

Después de la instalación, tienes estas credenciales para probar:

```
Email:    admin@impresion3d.local
Password: Chanduk11
```

### Para cambiar la contraseña en producción:

1. **Crear un nuevo usuario admin:**
```bash
# Usa el script de creación
export DATABASE_URL="file:./prisma/dev.db"
node prisma/create-admin.js
```

2. **O cambiar manualmente en la BD:**
```bash
npx prisma studio
# Edita el usuario directamente
```

---

## 2️⃣ FLUJO DE AUTENTICACIÓN

### Paso 1: Registrarse o Login

**Registro (crear nuevo usuario):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123"
  }'

# Response:
{
  "success": true,
  "token": "abc123def456...",
  "user": {
    "id": "cmnhifh2s0000f37lcf3gzsqb",
    "email": "usuario@example.com",
    "role": "user"
  }
}
```

**Login (acceder con credenciales):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@impresion3d.local",
    "password": "Chanduk11"
  }'

# Response:
{
  "success": true,
  "token": "abc123def456...",
  "user": {
    "id": "cmnhifh2s0000f37lcf3gzsqb",
    "email": "admin@impresion3d.local",
    "role": "admin"
  }
}
```

### Paso 2: Usar el token para acceder a endpoints protegidos

```bash
# Incluir Authorization header con el token
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer abc123def456..."

# Response: Lista de impresoras (si eres admin)
```

### Paso 3: Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer abc123def456..."

# Response:
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

## 3️⃣ PROTEGER LOS ENDPOINTS

Todos los endpoints necesitan ser protegidos. Aquí está el patrón:

### ✅ Endpoint PROTEGIDO (ejemplo actual)

```typescript
// app/api/printers/route.ts

import { validateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"

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

export async function GET(request: NextRequest) {
  // ✅ Validar primero
  const auth = await requireAuth(request)
  if (auth.error) return auth.response

  // Resto del código...
  const printers = await prisma.printer.findMany()
  return withCORS(NextResponse.json(printers))
}
```

### Para proteger TODOS los endpoints:

Hay que repetir el patrón `requireAuth` en:

```
✅ DONE:
- app/api/printers/route.ts

❌ TODO:
- app/api/printers/[id]/route.ts
- app/api/orders/route.ts
- app/api/orders/[id]/route.ts
- app/api/clients/route.ts
- app/api/clients/[id]/route.ts
- app/api/materials/route.ts
- app/api/materials/[id]/route.ts
- app/api/pieces/route.ts
- app/api/pieces/[id]/route.ts
- app/api/printjobs/route.ts
- app/api/printjobs/[id]/route.ts
- app/api/maintenance/route.ts
- app/api/maintenance/[id]/route.ts
- app/api/settings/route.ts
- app/api/dashboard/stats/route.ts
```

---

## 4️⃣ SISTEMA DE ROLES Y PERMISOS

### Roles disponibles:

- **`admin`** - Acceso total, puede crear/editar/eliminar
- **`user`** - Acceso limitado, solo lectura y su propia información

### Para operaciones administrativas:

```typescript
// Solo admins pueden eliminar
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.response

  // ✅ Validar que sea admin
  if (auth.user.role !== "admin") {
    return withCORS(
      NextResponse.json(
        { error: "Acceso denegado - Solo administradores" },
        { status: 403 }
      )
    )
  }

  // Operación segura
  await prisma.printer.delete({...})
  return withCORS(NextResponse.json({ success: true }))
}
```

---

## 5️⃣ VARIABLES DE ENTORNO

Actualiza `.env.local` con:

```env
# Database (cambiar en producción)
DATABASE_URL="file:./prisma/dev.db"

# Node environment
NODE_ENV="development"

# Security
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"

# En producción:
# NODE_ENV="production"
# NEXT_PUBLIC_APP_URL="https://tudominio.com"
# ALLOWED_ORIGINS="https://tudominio.com"
```

---

## 6️⃣ BEFORE YOU GO LIVE 🚨

### ❌ NUNCA en producción:

```env
# ✅ Cambiar SIEMPRE
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # ← Cambiar a tu dominio

# ✅ Cambiar contraseña admin
admin@impresion3d.local / Chanduk11  # ← Crear nueva
```

### ✅ TODO para producción:

- [ ] **HTTPS obligatorio**
  - Usar certificado SSL/TLS
  - Force HTTPS en nginx/Apache

- [ ] **Rate Limiting**
  ```bash
  npm install express-rate-limit
  ```

- [ ] **CORS correcto**
  ```env
  ALLOWED_ORIGINS="https://tudominio.com"
  ```

- [ ] **Database seguro**
  - PostgreSQL en lugar de SQLite
  - Backups automáticos
  - Encriptación en tránsito

- [ ] **Variables de entorno**
  - Usar AWS Secrets Manager o similar
  - NUNCA en código

- [ ] **Auditoría y Logs**
  - Logger centralizado (LogRocket, Sentry, etc.)
  - Registrar intentos fallidos
  - Registrar cambios de datos

- [ ] **2FA (Autenticación de Dos Factores)**
  - Google Authenticator o SMS
  - Especialmente para admin

- [ ] **Monitoreo**
  - Uptime monitoring
  - Performance monitoring
  - Security alerts

---

## 7️⃣ TESTING

### Test de seguridad básico:

```bash
# 1. Sin token = Acceso denegado
curl http://localhost:3000/api/printers
# Esperado: 401 - No autorizado

# 2. Token inválido
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer invalidtoken123"
# Esperado: 401 - Token inválido o expirado

# 3. Con token válido
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer abc123def456..."
# Esperado: 200 - Datos de impresoras

# 4. User intenta operación admin
curl -X DELETE http://localhost:3000/api/printers/123 \
  -H "Authorization: Bearer user-token"
# Esperado: 403 - Acceso denegado
```

---

## 8️⃣ TROUBLESHOOTING

### ❌ "Token requerido"
**Causa:** No incluiste el header `Authorization`  
**Solución:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/...
```

### ❌ "Token inválido o expirado"
**Causa:** Token expirado (24 horas) o inválido  
**Solución:** Hacer login de nuevo para obtener nuevo token

### ❌ "Acceso denegado - Solo administradores"
**Causa:** Tu usuario no es admin  
**Solución:** Usar cuenta admin o crear una con rol admin

### ❌ "Credenciales inválidas"
**Causa:** Email o contraseña incorrectos  
**Solución:** Verificar que tienes los datos correctos

---

## 9️⃣ PRÓXIMOS PASOS

1. **Proteger todos los endpoints** (15 minutos)
2. **Implementar Rate Limiting** (30 minutos)
3. **Agregar 2FA** (1 hora)
4. **Integración con Creality Cloud** (depende)
5. **Deploy a producción** (con HTTPS)

---

## 🔗 Recursos útiles

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Bcrypt Password Hashing](https://www.npmjs.com/package/bcryptjs)
- [Prisma Security](https://www.prisma.io/docs/concepts/more/security)

---

**¿Preguntas o problemas?** Revisa `SECURITY_REPORT.md` para más detalles
