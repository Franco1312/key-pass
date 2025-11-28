# Guía de Deployment en Render.com

## Requisitos Previos

- Cuenta en Render.com
- Repositorio Git (GitHub, GitLab, o Bitbucket)

## Pasos para Deployment

### 1. Crear Base de Datos PostgreSQL

1. En Render Dashboard, crear un nuevo **PostgreSQL Database**
2. Configurar:
   - **Name:** `key-pass-db` (o el nombre que prefieras)
   - **Plan:** Free (o el plan que necesites)
   - **Database:** `keypass` (o el nombre que prefieras)
   - **User:** Se genera automáticamente
3. Guardar la **Internal Database URL** (se usará más adelante)

### 2. Ejecutar Migraciones

**Opción A: Desde tu máquina local**
```bash
# Configurar DATABASE_URL con la Internal Database URL de Render
export DATABASE_URL="postgres://user:pass@host:port/db"
npm run migrate:up
```

**Opción B: Desde Render (recomendado)**
- Crear un servicio temporal "Shell Script" en Render
- O usar la consola de la base de datos para ejecutar el SQL manualmente
- Copiar el contenido de `src/infrastructure/db/migrations/001_initial_schema.sql`

### 3. Crear Web Service

1. En Render Dashboard, crear un nuevo **Web Service**
2. Conectar tu repositorio Git
3. Configurar:
   - **Name:** `key-pass-auth` (o el nombre que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (o el plan que necesites)

### 4. Configurar Variables de Entorno

En la sección **Environment** del Web Service, agregar:

| Variable | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render asigna el puerto automáticamente, pero puedes usar 10000 como default |
| `DATABASE_URL` | `[Internal Database URL]` | Usar la Internal Database URL de la base de datos creada |
| `JWT_ACCESS_TOKEN_SECRET` | `[generar secreto]` | Mínimo 32 caracteres. Generar con: `openssl rand -hex 32` |
| `JWT_REFRESH_TOKEN_SECRET` | `[generar secreto]` | Mínimo 32 caracteres. Generar con: `openssl rand -hex 32` |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | `15m` | Opcional, default es 15m |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | `30d` | Opcional, default es 30d |

**Nota sobre DATABASE_URL:**
- Usar la **Internal Database URL** (no la External) para mejor rendimiento
- Formato: `postgres://user:password@host:port/database`

### 5. Generar Secretos JWT

En tu terminal local:
```bash
# Generar JWT_ACCESS_TOKEN_SECRET
openssl rand -hex 32

# Generar JWT_REFRESH_TOKEN_SECRET
openssl rand -hex 32
```

O usar cualquier generador de strings aleatorios (mínimo 32 caracteres).

### 6. Desplegar

1. Hacer commit y push de tus cambios
2. Render detectará automáticamente el push y comenzará el build
3. Monitorear los logs en Render Dashboard
4. Una vez completado, el servicio estará disponible en: `https://key-pass-auth.onrender.com` (o tu dominio personalizado)

## Verificación Post-Deployment

### 1. Health Check
```bash
curl https://tu-servicio.onrender.com/health
```
Debería retornar: `{"status":"ok","timestamp":"..."}`

### 2. Swagger Documentation
Visitar: `https://tu-servicio.onrender.com/api-docs`

### 3. Probar Endpoint
```bash
curl -X POST https://tu-servicio.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Configuración Adicional

### Custom Domain (Opcional)
1. En Render Dashboard, ir a **Settings** del Web Service
2. Agregar tu dominio personalizado
3. Configurar DNS según las instrucciones de Render

### Auto-Deploy
- Por defecto, Render despliega automáticamente en cada push a la rama principal
- Puedes configurar ramas específicas en **Settings** > **Build & Deploy**

### Environment Variables Sensibles
- **Nunca** commitear secretos en el código
- Usar siempre variables de entorno en Render
- Para desarrollo local, usar archivo `.env` (ya está en `.gitignore`)

## Troubleshooting

### Error: "Cannot connect to database"
- Verificar que `DATABASE_URL` use la Internal Database URL
- Verificar que la base de datos esté en el mismo región/red que el web service
- Verificar que las migraciones se hayan ejecutado

### Error: "Port already in use"
- Render asigna el puerto automáticamente vía variable `PORT`
- No hardcodear el puerto en el código
- El código ya está configurado para usar `process.env.PORT`

### Error: "Invalid environment variables"
- Verificar que todas las variables requeridas estén configuradas
- Verificar que los secretos JWT tengan al menos 32 caracteres
- Revisar los logs de build en Render

### Build Falla
- Verificar que `npm install` se ejecute correctamente
- Verificar que `npm run build` compile sin errores
- Revisar los logs de build para errores específicos

## Notas Importantes

1. **Base de Datos:**
   - En el plan Free, la base de datos se pausa después de 90 días de inactividad
   - Para producción, considerar un plan pago
   - Las conexiones SSL están configuradas automáticamente para Render

2. **Web Service:**
   - En el plan Free, el servicio se pausa después de 15 minutos de inactividad
   - El primer request después de pausa puede tardar ~30 segundos
   - Para producción, considerar un plan pago

3. **Migraciones:**
   - Ejecutar migraciones antes de desplegar el servicio
   - Para migraciones futuras, crear un script separado o usar un servicio temporal

4. **Logs:**
   - Los logs están disponibles en Render Dashboard
   - Útiles para debugging en producción

## Checklist Pre-Deployment

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Migraciones ejecutadas (tablas creadas)
- [ ] Web Service creado y conectado al repositorio
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (o dejar que Render lo asigne)
  - [ ] `DATABASE_URL` (Internal Database URL)
  - [ ] `JWT_ACCESS_TOKEN_SECRET` (mínimo 32 caracteres)
  - [ ] `JWT_REFRESH_TOKEN_SECRET` (mínimo 32 caracteres)
  - [ ] `JWT_ACCESS_TOKEN_EXPIRES_IN` (opcional)
  - [ ] `JWT_REFRESH_TOKEN_EXPIRES_IN` (opcional)
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Health check endpoint funcionando
- [ ] Swagger documentation accesible

## Actualizar INTEGRATION_GUIDE.md

Después del deployment, actualizar la URL base en `INTEGRATION_GUIDE.md`:
- Cambiar `http://localhost:3001` por tu URL de Render
- Actualizar la sección de "Configuración Inicial"

