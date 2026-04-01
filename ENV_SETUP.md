# Environment Variables Setup

Este documento describe cómo configurar las variables de entorno para el proyecto Nevada Inventory System.

## Quick Start

1. **Copiar el archivo de ejemplo:**
```bash
cp .env.example .env.local
```

2. **Ajustar las variables según tu ambiente** (ver secciones abajo)

3. **Reiniciar el servidor dev:**
```bash
npm run dev
```

## Variables de Entorno

### 📱 Configuración de la Aplicación

#### `NEXT_PUBLIC_APP_URL`
- **Descripción:** URL base de la aplicación
- **Usado en:** Open Graph tags, URLs canónicas, links absolutos
- **Ejemplos:**
  - `http://localhost:3000` (desarrollo local)
  - `https://app.staging.example.com` (staging)
  - `https://app.example.com` (producción)
- **Tipo:** URL válida
- **Requerido:** ✅ Sí
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)

#### `NEXT_PUBLIC_APP_NAME`
- **Descripción:** Nombre de la aplicación mostrado en la UI
- **Usado en:** Títulos de página, headers, metadatos
- **Ejemplo:** `Nevada Inventory System`
- **Requerido:** ✅ Sí
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)

### 🔗 Configuración de API

#### `NEXT_PUBLIC_API_URL`
- **Descripción:** URL base del backend API
- **Usado en:** Todas las llamadas HTTP a la API
- **Ejemplos:**
  - `http://localhost:8080` (desarrollo local)
  - `https://api.staging.example.com` (staging)
  - `https://api.example.com` (producción)
- **Tipo:** URL válida
- **Requerido:** ✅ Sí
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **Nota:** Si usas CORS, asegúrate que el backend acepta requests desde `NEXT_PUBLIC_APP_URL`

#### `NEXT_PUBLIC_API_TIMEOUT`
- **Descripción:** Timeout para requests HTTP (en millisegundos)
- **Default:** `30000` (30 segundos)
- **Rango recomendado:** `5000` - `60000`
- **Tipo:** Número entero
- **Requerido:** ❌ No
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **Nota:** Aumenta si tienes requests largas, disminuye para fallar más rápido

### 🔐 Configuración de Autenticación

#### `NEXT_PUBLIC_AUTH_COOKIE_NAME`
- **Descripción:** Nombre de la cookie para almacenar tokens de autenticación
- **Default:** `nevada_auth_token`
- **Requerido:** ✅ Sí
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **⚠️ Importante:** Debe coincidir exactamente con el nombre usado en el backend

#### `NEXT_PUBLIC_REFRESH_COOKIE_NAME`
- **Descripción:** Nombre de la cookie para almacenar refresh tokens
- **Default:** `nevada_refresh_token`
- **Requerido:** ✅ Sí
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **⚠️ Importante:** Debe coincidir exactamente con el nombre usado en el backend

### 🧪 Desarrollo y Testing

#### `NEXT_PUBLIC_ENABLE_MOCK_API`
- **Descripción:** Habilitar API mock (para desarrollo sin backend)
- **Valores:** `true` o `false`
- **Default:** `false`
- **Requerido:** ❌ No
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **Casos de uso:**
  - `true` - Desarrollo frontend sin backend (usa datos simulados)
  - `false` - Uso de backend real (requests HTTP reales)

### 📊 Monitoreo y Error Tracking

#### `NEXT_PUBLIC_SENTRY_DSN`
- **Descripción:** Data Source Name de Sentry para error tracking
- **Default:** (vacío - Sentry deshabilitado)
- **Obten tu DSN en:** https://sentry.io/
- **Ejemplo:** `https://examplePublicKey@o0.ingest.sentry.io/0`
- **Requerido:** ❌ No
- **Expuesto al navegador:** ✅ Sí (NEXT_PUBLIC_)
- **Tier gratuito:** 5,000 eventos/mes
- **Nota:** Deixar vacío para deshabilitar Sentry

#### `SENTRY_AUTH_TOKEN`
- **Descripción:** Token de autenticación de Sentry (solo para uploads de source maps en build)
- **Obten tu token en:** https://sentry.io/settings/account/auth-tokens/
- **Requerido:** ❌ No (solo si usas Sentry)
- **Expuesto al navegador:** ❌ No (server-side only)
- **Cuando usarlo:**
  - Producción con Sentry habilitado
  - Quieres source maps para mejor debugging
- **Cuando NO usarlo:**
  - Desarrollo local
  - No usas Sentry

## Configuraciones por Ambiente

### 🖥️ Desarrollo Local (sin Backend)

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nevada Inventory System
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Comando para correr:**
```bash
npm run dev
```

### 🖥️ Desarrollo Local (con Backend)

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nevada Inventory System
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Requisitos:**
- Backend corriendo en `http://localhost:8080`
- Backend configurado para aceptar CORS desde `http://localhost:3000`

**Comando para correr:**
```bash
npm run dev
```

### 🧪 Testing

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nevada Inventory System
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Comando para correr:**
```bash
npm run test
```

### 🚀 Staging

```bash
NEXT_PUBLIC_APP_URL=https://app.staging.example.com
NEXT_PUBLIC_APP_NAME=Nevada Inventory System
NEXT_PUBLIC_API_URL=https://api.staging.example.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_SENTRY_DSN=https://xxxPublicKey@o0.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxx
```

### 🌍 Producción

```bash
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_APP_NAME=Nevada Inventory System
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_SENTRY_DSN=https://xxxPublicKey@o0.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxx
```

## ⚠️ Consideraciones de Seguridad

### Variables Públicas vs. Privadas

- **`NEXT_PUBLIC_*`:** Visibles en el código del cliente (bundle de JavaScript)
  - ✅ OK: URLs, nombres, configuración general
  - ❌ NO: API keys privadas, tokens, contraseñas

- **Sin `NEXT_PUBLIC_`:** Solo accesibles en el servidor
  - ✅ Usar para: API keys, tokens, contraseñas
  - Nota: `SENTRY_AUTH_TOKEN` es un ejemplo

### Nunca commitear `.env.local`

```bash
# .gitignore ya incluye esto:
.env.local
.env.*.local
```

## 🔄 Cambios en Tiempo de Desarrollo

### Cambios que requieren reinicio del servidor dev:
- Cualquier variable `NEXT_PUBLIC_*`
- `SENTRY_AUTH_TOKEN` (solo afecta en build time)

**Reinicia con:**
```bash
# Detener actual: Ctrl+C
npm run dev
```

### Cambios que se aplican sin reinicio:
- Variables de runtime (después del build)

## 🐛 Debugging

### Verificar variables cargadas:

En el navegador, abre la consola y ejecuta:
```javascript
// Variables públicas disponibles en el cliente:
console.log(process.env.NEXT_PUBLIC_API_URL)
console.log(process.env.NEXT_PUBLIC_APP_NAME)
```

### En el servidor:

```typescript
// src/config/env.ts o similar
console.log(process.env.NEXT_PUBLIC_API_URL)  // ✅ Accesible
console.log(process.env.SENTRY_AUTH_TOKEN)     // ✅ Accesible
```

## 📚 Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Sentry Documentation](https://docs.sentry.io/)
- [CORS - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Creado:** 2026-04-01  
**Proyecto:** Nevada Inventory System
