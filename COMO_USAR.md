# 🚀 Cómo Usar la App (Con Seguridad)

## 1️⃣ Iniciar el servidor

```bash
npm run dev
```

Se abrirá en http://localhost:3000

## 2️⃣ Login

### En el navegador:
La app debería pedirte login automáticamente.

### Credenciales:
```
Email:    admin@impresion3d.local
Password: Chanduk11
```

### Con curl (si usas API directamente):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@impresion3d.local",
    "password": "Chanduk11"
  }'
```

## 3️⃣ Usar el token

La respuesta te dará un token. Úsalo en futuras peticiones:

```bash
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer <tu_token_aqui>"
```

## 4️⃣ Crear otro usuario

Puedes registrar más usuarios con:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "MiPassword123"
  }'
```

⚠️ **Nota:** El primer usuario es admin, los demás son normales.

## 5️⃣ Ver/editar la base de datos

```bash
npx prisma studio
```

Se abre una interfaz en http://localhost:5555

---

## 📋 Lo que quedó HECHO ✅

1. ✅ Sistema de autenticación con bcrypt
2. ✅ Control de roles (admin/user)
3. ✅ Tokens de sesión
4. ✅ CORS seguro
5. ✅ Endpoint de login
6. ✅ Endpoint de register
7. ✅ Endpoint de logout
8. ✅ Ejemplo de endpoint protegido (printers)
9. ✅ Migraciones de BD
10. ✅ Usuario admin creado

---

## 🚨 Lo que FALTA (TODO)

Antes de poder conectar a Creality Cloud o ir a producción:

1. ❌ Proteger todos los demás endpoints (16 más)
2. ❌ Implementar Rate Limiting
3. ❌ Implementar 2FA
4. ❌ Implementar Logs/Auditoría
5. ❌ Implementar HTTPS

---

## 📁 Archivos principales que se crearon

```
lib/
├── auth.ts              # ← Funciones de autenticación
├── middleware.ts        # ← Protección de endpoints
├── calculations.ts      # (existente)
├── schemas.ts           # (existente)
└── stores.ts            # (existente)

app/api/auth/
├── login/route.ts       # ← Endpoint login
├── register/route.ts    # ← Endpoint register
└── logout/route.ts      # ← Endpoint logout

prisma/
├── schema.prisma        # ← Actualizado con User y Session
├── create-admin.js      # ← Script crear admin
└── dev.db               # ← Base de datos SQLite

Documentación:
├── SECURITY_REPORT.md           # Reporte detallado
├── SECURITY_SETUP.md            # Guía de configuración
├── CREALITY_INTEGRATION.md      # Para conectar Creality
├── SEGURIDAD_RESUMEN.txt        # Este resumen
└── COMO_USAR.md                 # Este archivo
```

---

## 🔐 ¿Cómo funciona la seguridad?

### Antes (SIN seguridad):
```
User → GET /api/printers → ✅ Datos públicos (INSEGURO)
Attacker → GET /api/printers → ✅ Datos públicos (INSEGURO)
```

### Ahora (CON seguridad):
```
User → POST /api/auth/login → ✅ Token
User → GET /api/printers + Token → ✅ Datos autorizados

Attacker → GET /api/printers → ❌ 401 Unauthorized
Attacker → GET /api/printers + FakeToken → ❌ 401 Token inválido
```

---

## ⚙️ Configuración

### Variables de entorno (.env.local):

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### En producción cambiar a:

```env
DATABASE_URL="postgresql://user:pass@host/db"  # PostgreSQL
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://tudominio.com"
ALLOWED_ORIGINS="https://tudominio.com"
```

---

## 🧪 Test rápido de seguridad

Abre una terminal y prueba esto:

### 1. Sin token (debe fallar):
```bash
curl http://localhost:3000/api/printers
```
Esperado: `{"error":"No autorizado - Token requerido"}`

### 2. Login (obtener token):
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@impresion3d.local",
    "password":"Chanduk11"
  }' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### 3. Con token válido (debe funcionar):
```bash
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer $TOKEN"
```
Esperado: Lista de impresoras en JSON

### 4. Con token inválido (debe fallar):
```bash
curl http://localhost:3000/api/printers \
  -H "Authorization: Bearer token_falso"
```
Esperado: `{"error":"Token inválido o expirado"}`

---

## 💡 Tips importantes

### Para integrar con Creality Cloud:

1. Obtén API Key en https://cloud.creality.com
2. Guárdalo en `.env.local` como `CREALITY_API_KEY`
3. Sigue la guía en `CREALITY_INTEGRATION.md`

### Para cambiar contraseña admin:

```bash
# Opción 1: Crear nuevo admin
export DATABASE_URL="file:./prisma/dev.db"
node prisma/create-admin.js

# Opción 2: Via Prisma Studio
npx prisma studio
# Edita el usuario directamente
```

### Para ver logs de autenticación:

Abre la consola del navegador (F12) o revisa la terminal del servidor.

---

## ❌ Problemas comunes

### "Token requerido"
Necesitas incluir el header `Authorization: Bearer <token>`

### "Token inválido o expirado"
El token expiró (válido 24h). Haz login de nuevo.

### "CORS error"
Asegúrate de que tu dominio está en `ALLOWED_ORIGINS` en .env

### "Credenciales inválidas"
Revisa que el email y contraseña sean correctos.

### "Database error"
```bash
# Regenerar BD:
rm prisma/dev.db
npx prisma migrate dev
export DATABASE_URL="file:./prisma/dev.db"
node prisma/create-admin.js
```

---

## 📞 Soporte

Lee los archivos de documentación:
1. `SEGURIDAD_RESUMEN.txt` - Resumen rápido
2. `SECURITY_SETUP.md` - Guía completa
3. `SECURITY_REPORT.md` - Análisis técnico
4. `CREALITY_INTEGRATION.md` - Integración Creality

---

## ✅ Checklist antes de producción

- [ ] Todos los endpoints protegidos
- [ ] Rate limiting implementado
- [ ] HTTPS configurado
- [ ] Variables de entorno seguras
- [ ] Contraseña admin cambiada
- [ ] Base de datos PostgreSQL (no SQLite)
- [ ] Backups automáticos
- [ ] Logs centralizados
- [ ] Monitoreo de seguridad
- [ ] 2FA implementado

---

**Última actualización:** 2026-04-02  
**Estado:** ✅ Base de seguridad implementada
