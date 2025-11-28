# Guía de Integración - Key Pass Auth Service

## Información General

**URL Base:** `http://localhost:3001`  
**Documentación Swagger:** `http://localhost:3001/api-docs`

## Configuración Inicial

### Variables de Entorno Necesarias
- `API_BASE_URL`: URL base del servicio (ej: `http://localhost:3001`)
- Para producción, configurar la URL del servidor desplegado

### Headers Requeridos
- **Content-Type:** `application/json` (para todas las peticiones con body)
- **Authorization:** `Bearer {accessToken}` (para endpoints protegidos)

## Endpoints Disponibles

### Autenticación

#### 1. Registro de Usuario
**Endpoint:** `POST /auth/register`

**Body:**
- `email` (string, formato email, requerido)
- `password` (string, mínimo 8 caracteres, requerido)

**Respuesta Exitosa (201):**
- `user`: Objeto con `id`, `email`, `role`, `plan`, `isEmailVerified`

**Errores:**
- `409`: Email ya en uso
- `400`: Error de validación (email inválido, contraseña muy corta)

**Notas:**
- El usuario se crea con `role: "USER"` y `plan: "FREE"` por defecto
- Se envía automáticamente un email de verificación (en desarrollo se muestra en consola)
- El usuario debe verificar su email antes de poder usar ciertas funcionalidades

---

#### 2. Login
**Endpoint:** `POST /auth/login`

**Body:**
- `email` (string, formato email, requerido)
- `password` (string, requerido)

**Respuesta Exitosa (200):**
- `accessToken`: JWT token de acceso (válido por 15 minutos por defecto)
- `refreshToken`: Token para renovar el access token (válido por 30 días por defecto)
- `user`: Objeto con `id`, `email`, `role`, `plan`

**Errores:**
- `401`: Credenciales inválidas
- `400`: Error de validación

**Notas:**
- Guardar ambos tokens de forma segura (AsyncStorage en React Native)
- El `accessToken` debe incluirse en el header `Authorization` para endpoints protegidos
- El `refreshToken` se usa para obtener un nuevo `accessToken` cuando expire

---

#### 3. Refresh Token
**Endpoint:** `POST /auth/refresh`

**Body:**
- `refreshToken` (string, requerido)

**Respuesta Exitosa (200):**
- `accessToken`: Nuevo JWT token de acceso
- `refreshToken`: Nuevo refresh token (rotación de tokens)

**Errores:**
- `400`: Token inválido, revocado o expirado

**Notas:**
- Implementar refresh automático cuando el `accessToken` expire
- El refresh token anterior se revoca automáticamente (token rotation)
- Guardar el nuevo `refreshToken` reemplazando el anterior

---

#### 4. Logout
**Endpoint:** `POST /auth/logout`

**Body:**
- `refreshToken` (string, requerido)
- `revokeAll` (boolean, opcional): Si es `true`, revoca todos los tokens del usuario

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `400`: Error de validación

**Notas:**
- Usar `revokeAll: true` para cerrar sesión en todos los dispositivos
- Eliminar tokens del almacenamiento local después del logout exitoso

---

#### 5. Solicitar Reset de Contraseña
**Endpoint:** `POST /auth/forgot-password`

**Body:**
- `email` (string, formato email, requerido)

**Respuesta Exitosa (204):**
- Sin contenido (por seguridad, siempre retorna 204 aunque el email no exista)

**Errores:**
- `400`: Error de validación

**Notas:**
- En desarrollo, el token de reset se muestra en consola del servidor
- En producción, se envía por email
- El token expira en 1 hora

---

#### 6. Reset de Contraseña
**Endpoint:** `POST /auth/reset-password`

**Body:**
- `token` (string, requerido): Token recibido por email
- `newPassword` (string, mínimo 8 caracteres, requerido)

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `400`: Token inválido, expirado o ya usado
- `400`: Error de validación (contraseña muy corta)

**Notas:**
- Después de reset exitoso, todos los refresh tokens del usuario se revocan
- El usuario debe hacer login nuevamente

---

#### 7. Enviar Email de Verificación
**Endpoint:** `POST /auth/send-verification-email`

**Headers:**
- `Authorization: Bearer {accessToken}` (requerido)

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `401`: No autenticado
- `400`: Usuario ya verificado

**Notas:**
- Solo se envía si el email no está verificado
- En desarrollo, el token se muestra en consola del servidor
- El token expira en 24 horas

---

#### 8. Verificar Email
**Endpoint:** `POST /auth/verify-email`

**Body:**
- `token` (string, requerido): Token recibido por email

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `400`: Token inválido, expirado o ya usado

**Notas:**
- Una vez verificado, el usuario puede acceder a funcionalidades que requieren email verificado

---

### Usuario

#### 9. Obtener Usuario Actual
**Endpoint:** `GET /me`

**Headers:**
- `Authorization: Bearer {accessToken}` (requerido)

**Respuesta Exitosa (200):**
- `id`: UUID del usuario
- `email`: Email del usuario
- `role`: Rol del usuario (`USER` o `ADMIN`)
- `plan`: Plan de suscripción (ej: `FREE`, `PREMIUM`)
- `planExpiresAt`: Fecha de expiración del plan (puede ser `null`)
- `isEmailVerified`: Estado de verificación del email

**Errores:**
- `401`: No autenticado o token inválido
- `404`: Usuario no encontrado

**Notas:**
- Usar este endpoint para verificar el estado de autenticación
- Útil para mostrar información del perfil del usuario

---

#### 10. Actualizar Plan (Upgrade)
**Endpoint:** `POST /me/upgrade-plan`

**Headers:**
- `Authorization: Bearer {accessToken}` (requerido)

**Body:**
- `planCode` (string, requerido): Código del plan (ej: `PREMIUM`)

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `401`: No autenticado
- `404`: Plan no encontrado
- `400`: Error de validación

**Notas:**
- El plan debe existir en la base de datos
- Si el plan tiene ciclo de facturación (`MONTHLY` o `YEARLY`), se establece `planExpiresAt`
- Para planes `FREE`, `planExpiresAt` se establece como `null`

---

#### 11. Degradar Plan (Downgrade)
**Endpoint:** `POST /me/downgrade-plan`

**Headers:**
- `Authorization: Bearer {accessToken}` (requerido)

**Body:**
- `planCode` (string, requerido): Código del plan (ej: `FREE`)

**Respuesta Exitosa (204):**
- Sin contenido

**Errores:**
- `401`: No autenticado
- `404`: Plan no encontrado
- `400`: Error de validación

**Notas:**
- Similar a upgrade pero típicamente usado para degradar a un plan inferior
- `planExpiresAt` se establece como `null`

---

## Flujos de Autenticación

### Flujo de Registro e Inicio de Sesión

1. **Registro:**
   - Usuario se registra con email y contraseña
   - Recibe información del usuario creado
   - Se envía email de verificación automáticamente

2. **Verificación de Email:**
   - Usuario recibe token por email (en desarrollo: consola del servidor)
   - Usa el token para verificar su email
   - Una vez verificado, puede acceder a todas las funcionalidades

3. **Login:**
   - Usuario ingresa email y contraseña
   - Recibe `accessToken` y `refreshToken`
   - Guarda ambos tokens de forma segura

4. **Uso de la App:**
   - Incluye `accessToken` en header `Authorization` para requests protegidos
   - Cuando el `accessToken` expire, usa `refreshToken` para obtener uno nuevo

### Flujo de Recuperación de Contraseña

1. **Solicitar Reset:**
   - Usuario ingresa su email
   - Recibe token por email (en desarrollo: consola del servidor)

2. **Reset de Contraseña:**
   - Usuario ingresa token y nueva contraseña
   - Todos los tokens anteriores se revocan
   - Usuario debe hacer login nuevamente

### Flujo de Refresh Token

1. **Token Expirado:**
   - Request falla con `401 Unauthorized`
   - App detecta el error y automáticamente intenta refresh

2. **Refresh:**
   - Envía `refreshToken` al endpoint `/auth/refresh`
   - Recibe nuevo `accessToken` y `refreshToken`
   - Actualiza tokens en almacenamiento
   - Reintenta el request original con el nuevo token

3. **Refresh Token Expirado:**
   - Si el `refreshToken` también expiró, redirigir al usuario al login

---

## Manejo de Tokens

### Almacenamiento
- **AsyncStorage** (React Native): Guardar tokens de forma segura
- **Claves sugeridas:**
  - `@auth:accessToken`
  - `@auth:refreshToken`
  - `@auth:user` (opcional, para cachear información del usuario)

### Expiración
- **Access Token:** 15 minutos (configurable vía `JWT_ACCESS_TOKEN_EXPIRES_IN`)
- **Refresh Token:** 30 días (configurable vía `JWT_REFRESH_TOKEN_EXPIRES_IN`)

### Rotación de Tokens
- Cada vez que se usa el refresh token, se genera un nuevo par de tokens
- El refresh token anterior se revoca automáticamente
- Siempre actualizar ambos tokens en el almacenamiento

---

## Códigos de Estado HTTP

- **200 OK:** Request exitoso con datos
- **201 Created:** Recurso creado exitosamente (registro)
- **204 No Content:** Request exitoso sin contenido (logout, reset, etc.)
- **400 Bad Request:** Error de validación o datos inválidos
- **401 Unauthorized:** No autenticado o token inválido/expirado
- **403 Forbidden:** Autenticado pero sin permisos (no usado actualmente)
- **404 Not Found:** Recurso no encontrado
- **409 Conflict:** Conflicto (email ya en uso)
- **500 Internal Server Error:** Error del servidor

---

## Estructura de Errores

### Error de Validación (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

### Error General
```json
{
  "error": "Mensaje de error descriptivo"
}
```

---

## Consideraciones para React Native

### Network Security
- En desarrollo con `localhost`, configurar correctamente el emulador/simulador
- Android: Usar `10.0.2.2` en lugar de `localhost` en el emulador
- iOS: `localhost` funciona en el simulador
- Para dispositivos físicos, usar la IP local de la máquina (ej: `192.168.1.100:3001`)

### Interceptores HTTP
- Implementar interceptor para agregar automáticamente el header `Authorization`
- Implementar interceptor para manejar refresh automático de tokens
- Manejar errores 401 y redirigir al login si el refresh falla

### Persistencia
- Guardar tokens en AsyncStorage al hacer login
- Cargar tokens al iniciar la app
- Verificar validez del token antes de hacer requests
- Limpiar tokens al hacer logout

### Manejo de Errores
- Mostrar mensajes de error amigables al usuario
- Manejar errores de red (timeout, sin conexión)
- Manejar errores de autenticación (token expirado, inválido)
- Implementar retry logic para requests fallidos

### Estados de Autenticación
- **No autenticado:** Usuario no ha hecho login
- **Autenticado:** Usuario tiene tokens válidos
- **Token expirado:** Access token expirado, refresh token válido
- **Sesión expirada:** Ambos tokens expirados, requiere login

---

## Endpoints por Funcionalidad

### Autenticación Básica
- Registro: `POST /auth/register`
- Login: `POST /auth/login`
- Logout: `POST /auth/logout`
- Refresh: `POST /auth/refresh`

### Verificación de Email
- Enviar verificación: `POST /auth/send-verification-email` (requiere auth)
- Verificar: `POST /auth/verify-email`

### Recuperación de Contraseña
- Solicitar reset: `POST /auth/forgot-password`
- Reset: `POST /auth/reset-password`

### Gestión de Usuario
- Obtener perfil: `GET /me` (requiere auth)
- Actualizar plan: `POST /me/upgrade-plan` (requiere auth)
- Degradar plan: `POST /me/downgrade-plan` (requiere auth)

---

## Roles y Permisos

### Roles Disponibles
- **USER:** Usuario estándar (por defecto)
- **ADMIN:** Administrador (asignado manualmente)

### Planes Disponibles
- **FREE:** Plan gratuito (por defecto)
- **PREMIUM:** Plan premium (y otros según configuración)

**Nota:** Los planes deben existir en la tabla `subscription_plans` de la base de datos. Por defecto, solo existe el plan `FREE` en el esquema inicial.

---

## Testing en Desarrollo

### Emulador Android
- URL: `http://10.0.2.2:3001`

### Simulador iOS
- URL: `http://localhost:3001`

### Dispositivo Físico
- URL: `http://{IP_LOCAL}:3001` (ej: `http://192.168.1.100:3001`)

### Verificación de Email y Reset de Contraseña
- En desarrollo, los tokens se muestran en la consola del servidor
- Buscar mensajes que comienzan con `[EMAIL]`
- Los tokens son UUIDs que se pueden copiar y usar directamente

---

## Mejores Prácticas

1. **Seguridad:**
   - Nunca loguear tokens en producción
   - Usar almacenamiento seguro para tokens
   - Implementar auto-logout después de inactividad prolongada

2. **UX:**
   - Mostrar estados de carga durante requests
   - Manejar errores de forma amigable
   - Implementar refresh automático de tokens sin interrumpir al usuario

3. **Performance:**
   - Cachear información del usuario cuando sea apropiado
   - Evitar requests innecesarios verificando validez de tokens
   - Implementar debounce para requests repetidos

4. **Mantenibilidad:**
   - Centralizar configuración de API (base URL, timeouts)
   - Usar tipos TypeScript si es posible
   - Implementar logging para debugging

---

## Notas Adicionales

- El servicio usa JWT para access tokens y tokens opacos (UUIDs) para refresh tokens
- Los refresh tokens se almacenan en la base de datos y pueden ser revocados
- El servicio implementa rotación de tokens para mayor seguridad
- Todos los endpoints de autenticación (excepto los protegidos) no requieren autenticación previa
- El servicio está diseñado para ser stateless en cuanto a access tokens, pero stateful para refresh tokens

---

## Soporte

Para más información sobre la implementación interna, consultar:
- Código fuente en `src/`
- Documentación Swagger en `http://localhost:3001/api-docs`
- README.md del proyecto

