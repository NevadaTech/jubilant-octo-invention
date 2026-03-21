# PRD: Integración Frontend de Combos

**Fecha**: 2026-03-19
**Autor**: Equipo de Producto
**Backend status**: Implementado al 100%
**Frontend status**: Pendiente

---

## 1. Resumen del Feature

Los **combos** son agrupaciones virtuales de productos existentes que se venden como una unidad a un precio fijo. A diferencia de un producto compuesto, el combo NO tiene stock propio: su disponibilidad se calcula dinámicamente a partir del stock de los productos componentes en cada bodega.

**Conceptos clave:**

- Un combo tiene un SKU propio (inmutable después de la creación), nombre, precio fijo y moneda.
- Cada combo contiene N items, donde cada item referencia un `productId` + `quantity`.
- La disponibilidad de un combo en una bodega = `min(stock_componente_i / cantidad_requerida_i)` para todos los componentes.
- Al vender un combo, el backend expande automáticamente los componentes y descuenta stock de cada uno.
- Los combos soportan soft-delete (desactivación).

---

## 2. API Endpoints

**Base URL**: `/inventory/combos`
**Autenticación**: Bearer JWT (header `Authorization: Bearer <token>`)
**Organización**: Se extrae automáticamente del token JWT (no se envía en el body).

### Envelope de Respuesta (patrón global)

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta exitosa paginada:**

```json
{
  "success": true,
  "message": "...",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta de error:**

```json
{
  "success": false,
  "message": "Descripción del error",
  "errorCode": "COMBO_NOT_FOUND",
  "error": {
    "statusCode": 404,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/inventory/combos/abc",
    "method": "GET",
    "details": {}
  }
}
```

---

### 2.1 Crear Combo

| Campo                | Valor               |
| -------------------- | ------------------- |
| **Method**           | `POST`              |
| **URL**              | `/inventory/combos` |
| **Permiso**          | `COMBOS:CREATE`     |
| **HTTP Status (ok)** | `201 Created`       |

**Request Body:**

| Campo         | Tipo          | Requerido | Validaciones              | Ejemplo                               |
| ------------- | ------------- | --------- | ------------------------- | ------------------------------------- |
| `sku`         | `string`      | Si        | min 3, max 50 chars       | `"COMBO-001"`                         |
| `name`        | `string`      | Si        | min 2, max 200 chars      | `"Weekend Bundle"`                    |
| `description` | `string`      | No        | max 1000 chars            | `"Bundle de productos para el finde"` |
| `price`       | `number`      | Si        | >= 0                      | `49.99`                               |
| `currency`    | `string`      | No        | ISO 4217, default `"COP"` | `"COP"`                               |
| `items`       | `ComboItem[]` | Si        | min 1 elemento            | ver abajo                             |

**ComboItem:**

| Campo       | Tipo           | Requerido | Validaciones | Ejemplo         |
| ----------- | -------------- | --------- | ------------ | --------------- |
| `productId` | `string`       | Si        | no vacio     | `"product-123"` |
| `quantity`  | `number` (int) | Si        | >= 1, entero | `2`             |

**Ejemplo Request:**

```json
{
  "sku": "COMBO-VERANO-01",
  "name": "Pack Verano",
  "description": "Protector solar + After sun + Gorra",
  "price": 45000,
  "currency": "COP",
  "items": [
    { "productId": "prod-protector-01", "quantity": 1 },
    { "productId": "prod-aftersun-01", "quantity": 1 },
    { "productId": "prod-gorra-01", "quantity": 1 }
  ]
}
```

**Ejemplo Response (201):**

```json
{
  "success": true,
  "message": "Combo created successfully",
  "data": {
    "id": "combo-uuid-123",
    "sku": "COMBO-VERANO-01",
    "name": "Pack Verano",
    "description": "Protector solar + After sun + Gorra",
    "price": 45000,
    "currency": "COP",
    "isActive": true,
    "orgId": "org-uuid",
    "items": [
      { "id": "item-uuid-1", "productId": "prod-protector-01", "quantity": 1 },
      { "id": "item-uuid-2", "productId": "prod-aftersun-01", "quantity": 1 },
      { "id": "item-uuid-3", "productId": "prod-gorra-01", "quantity": 1 }
    ],
    "createdAt": "2026-03-19T10:00:00.000Z",
    "updatedAt": "2026-03-19T10:00:00.000Z"
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code                | Causa                          |
| ----------- | ------------------------- | ------------------------------ |
| 400         | `COMBO_SKU_CONFLICT`      | Ya existe un combo con ese SKU |
| 400         | `COMBO_PRODUCT_NOT_FOUND` | Algun `productId` no existe    |
| 400         | `COMBO_CREATION_ERROR`    | Error generico de creacion     |
| 400         | `VALIDATION_ERROR`        | Validacion de campos fallida   |
| 403         | -                         | Sin permiso `COMBOS:CREATE`    |

---

### 2.2 Listar Combos

| Campo                | Valor               |
| -------------------- | ------------------- |
| **Method**           | `GET`               |
| **URL**              | `/inventory/combos` |
| **Permiso**          | `COMBOS:READ`       |
| **HTTP Status (ok)** | `200 OK`            |

**Query Params:**

| Param      | Tipo           | Requerido | Default | Descripcion                                    |
| ---------- | -------------- | --------- | ------- | ---------------------------------------------- |
| `page`     | `number` (int) | No        | `1`     | Pagina (1-based)                               |
| `limit`    | `number` (int) | No        | `10`    | Items por pagina                               |
| `isActive` | `boolean`      | No        | -       | Filtrar por estado activo/inactivo             |
| `name`     | `string`       | No        | -       | Busqueda parcial por nombre (case-insensitive) |
| `sku`      | `string`       | No        | -       | Busqueda exacta por SKU                        |

**Ejemplo Request:**

```
GET /inventory/combos?page=1&limit=10&isActive=true&name=verano
```

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combos retrieved successfully",
  "data": [
    {
      "id": "combo-uuid-123",
      "sku": "COMBO-VERANO-01",
      "name": "Pack Verano",
      "description": "Protector solar + After sun + Gorra",
      "price": 45000,
      "currency": "COP",
      "isActive": true,
      "orgId": "org-uuid",
      "items": [
        {
          "id": "item-uuid-1",
          "productId": "prod-protector-01",
          "quantity": 1
        },
        { "id": "item-uuid-2", "productId": "prod-aftersun-01", "quantity": 1 }
      ],
      "createdAt": "2026-03-19T10:00:00.000Z",
      "updatedAt": "2026-03-19T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

---

### 2.3 Obtener Combo por ID

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| **Method**           | `GET`                   |
| **URL**              | `/inventory/combos/:id` |
| **Permiso**          | `COMBOS:READ`           |
| **HTTP Status (ok)** | `200 OK`                |

**Path Params:**

| Param | Tipo     | Descripcion |
| ----- | -------- | ----------- |
| `id`  | `string` | Combo ID    |

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combo retrieved successfully",
  "data": {
    "id": "combo-uuid-123",
    "sku": "COMBO-VERANO-01",
    "name": "Pack Verano",
    "description": "...",
    "price": 45000,
    "currency": "COP",
    "isActive": true,
    "orgId": "org-uuid",
    "items": [
      { "id": "item-uuid-1", "productId": "prod-protector-01", "quantity": 1 },
      { "id": "item-uuid-2", "productId": "prod-aftersun-01", "quantity": 1 }
    ],
    "createdAt": "2026-03-19T10:00:00.000Z",
    "updatedAt": "2026-03-19T10:00:00.000Z"
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code        | Causa                      |
| ----------- | ----------------- | -------------------------- |
| 404         | `COMBO_NOT_FOUND` | No existe combo con ese ID |
| 403         | -                 | Sin permiso `COMBOS:READ`  |

---

### 2.4 Actualizar Combo

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| **Method**           | `PUT`                   |
| **URL**              | `/inventory/combos/:id` |
| **Permiso**          | `COMBOS:UPDATE`         |
| **HTTP Status (ok)** | `200 OK`                |

**IMPORTANTE: El SKU es inmutable. No se puede cambiar despues de la creacion.**

**Request Body (todos los campos opcionales):**

| Campo         | Tipo          | Requerido | Validaciones                     | Notas                     |
| ------------- | ------------- | --------- | -------------------------------- | ------------------------- |
| `name`        | `string`      | No        | min 2, max 200 chars             | -                         |
| `description` | `string`      | No        | max 1000 chars                   | -                         |
| `price`       | `number`      | No        | >= 0                             | -                         |
| `currency`    | `string`      | No        | ISO 4217                         | -                         |
| `items`       | `ComboItem[]` | No        | min 1 elem, **full replacement** | Reemplaza TODOS los items |

**Nota sobre `items`**: Si se envia el campo `items`, se reemplazan TODOS los items del combo. No es un merge parcial, es un full replacement. Si no se envia, los items no cambian.

**Ejemplo Request:**

```json
{
  "name": "Pack Verano Premium",
  "price": 55000,
  "items": [
    { "productId": "prod-protector-01", "quantity": 2 },
    { "productId": "prod-aftersun-01", "quantity": 1 },
    { "productId": "prod-toalla-01", "quantity": 1 }
  ]
}
```

**Ejemplo Response (200):** Misma estructura que Create, con `data` del combo actualizado.

**Errores posibles:**

| HTTP Status | Error Code                | Causa                                |
| ----------- | ------------------------- | ------------------------------------ |
| 404         | `COMBO_NOT_FOUND`         | No existe combo con ese ID           |
| 400         | `COMBO_SKU_IMMUTABLE`     | Se intento cambiar el SKU            |
| 400         | `COMBO_PRODUCT_NOT_FOUND` | Algun `productId` de items no existe |
| 400         | `COMBO_UPDATE_ERROR`      | Error generico de actualizacion      |
| 403         | -                         | Sin permiso `COMBOS:UPDATE`          |

---

### 2.5 Desactivar Combo (Soft Delete)

| Campo                | Valor                              |
| -------------------- | ---------------------------------- |
| **Method**           | `PATCH`                            |
| **URL**              | `/inventory/combos/:id/deactivate` |
| **Permiso**          | `COMBOS:DELETE`                    |
| **HTTP Status (ok)** | `200 OK`                           |

**No requiere body.**

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combo deactivated successfully",
  "data": {
    "id": "combo-uuid-123",
    "sku": "COMBO-VERANO-01",
    "name": "Pack Verano",
    "isActive": false,
    "...": "resto de campos del combo"
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code               | Causa                       |
| ----------- | ------------------------ | --------------------------- |
| 404         | `COMBO_NOT_FOUND`        | No existe combo con ese ID  |
| 400         | `COMBO_DEACTIVATE_ERROR` | Error al desactivar         |
| 403         | -                        | Sin permiso `COMBOS:DELETE` |

---

### 2.6 Disponibilidad de Combos

| Campo                | Valor                            |
| -------------------- | -------------------------------- |
| **Method**           | `GET`                            |
| **URL**              | `/inventory/combos/availability` |
| **Permiso**          | `COMBOS:READ`                    |
| **HTTP Status (ok)** | `200 OK`                         |

Calcula cuantos combos completos se pueden armar por bodega, basandose en el stock de cada componente.

**Query Params:**

| Param         | Tipo           | Requerido | Default | Descripcion                   |
| ------------- | -------------- | --------- | ------- | ----------------------------- |
| `page`        | `number` (int) | No        | `1`     | Pagina                        |
| `limit`       | `number` (int) | No        | `10`    | Items por pagina              |
| `isActive`    | `boolean`      | No        | -       | Filtrar por estado            |
| `name`        | `string`       | No        | -       | Busqueda parcial por nombre   |
| `sku`         | `string`       | No        | -       | Busqueda exacta por SKU       |
| `warehouseId` | `string`       | No        | -       | Filtrar por bodega especifica |

**Ejemplo Request:**

```
GET /inventory/combos/availability?isActive=true&warehouseId=wh-123
```

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combo availability retrieved successfully",
  "data": [
    {
      "id": "combo-uuid-123",
      "sku": "COMBO-VERANO-01",
      "name": "Pack Verano",
      "price": 45000,
      "isActive": true,
      "availability": [
        {
          "warehouseId": "wh-123",
          "warehouseName": "Bodega Principal",
          "available": 15
        },
        {
          "warehouseId": "wh-456",
          "warehouseName": "Bodega Norte",
          "available": 3
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code                  | Causa                            |
| ----------- | --------------------------- | -------------------------------- |
| 400         | `COMBO_AVAILABILITY_FAILED` | Error al calcular disponibilidad |
| 403         | -                           | Sin permiso `COMBOS:READ`        |

---

### 2.7 Reporte de Ventas por Combo

| Campo                | Valor                             |
| -------------------- | --------------------------------- |
| **Method**           | `GET`                             |
| **URL**              | `/inventory/combos/reports/sales` |
| **Permiso**          | `COMBOS:READ`                     |
| **HTTP Status (ok)** | `200 OK`                          |

**Query Params:**

| Param      | Tipo                | Requerido | Default | Descripcion                    |
| ---------- | ------------------- | --------- | ------- | ------------------------------ |
| `dateFrom` | `string` (ISO date) | No        | -       | Fecha inicio, ej: `2024-01-01` |
| `dateTo`   | `string` (ISO date) | No        | -       | Fecha fin, ej: `2024-12-31`    |
| `comboId`  | `string`            | No        | -       | Filtrar por combo especifico   |

**Ejemplo Request:**

```
GET /inventory/combos/reports/sales?dateFrom=2026-01-01&dateTo=2026-03-31
```

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combo sales report retrieved successfully",
  "data": [
    {
      "comboId": "combo-uuid-123",
      "sku": "COMBO-VERANO-01",
      "name": "Pack Verano",
      "totalComboUnitsSold": 150,
      "totalRevenue": 6750000,
      "salesCount": 120
    },
    {
      "comboId": "combo-uuid-456",
      "sku": "COMBO-INVIERNO-01",
      "name": "Pack Invierno",
      "totalComboUnitsSold": 80,
      "totalRevenue": 4000000,
      "salesCount": 65
    }
  ],
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code                  | Causa                     |
| ----------- | --------------------------- | ------------------------- |
| 400         | `COMBO_SALES_REPORT_FAILED` | Error al generar reporte  |
| 403         | -                           | Sin permiso `COMBOS:READ` |

---

### 2.8 Impacto en Stock por Producto (via Combos)

| Campo                | Valor                                               |
| -------------------- | --------------------------------------------------- |
| **Method**           | `GET`                                               |
| **URL**              | `/inventory/combos/reports/stock-impact/:productId` |
| **Permiso**          | `COMBOS:READ`                                       |
| **HTTP Status (ok)** | `200 OK`                                            |

Dado un producto, muestra cuantas unidades se vendieron directamente vs. a traves de combos.

**Path Params:**

| Param       | Tipo     | Descripcion                 |
| ----------- | -------- | --------------------------- |
| `productId` | `string` | ID del producto a consultar |

**Query Params:**

| Param      | Tipo                | Requerido | Default | Descripcion  |
| ---------- | ------------------- | --------- | ------- | ------------ |
| `dateFrom` | `string` (ISO date) | No        | -       | Fecha inicio |
| `dateTo`   | `string` (ISO date) | No        | -       | Fecha fin    |

**Ejemplo Request:**

```
GET /inventory/combos/reports/stock-impact/prod-protector-01?dateFrom=2026-01-01&dateTo=2026-03-31
```

**Ejemplo Response (200):**

```json
{
  "success": true,
  "message": "Combo stock impact retrieved successfully",
  "data": {
    "directSalesQty": 200,
    "comboSalesQty": 150,
    "totalQty": 350,
    "comboBreakdown": [
      {
        "comboId": "combo-uuid-123",
        "sku": "COMBO-VERANO-01",
        "name": "Pack Verano",
        "qty": 100
      },
      {
        "comboId": "combo-uuid-789",
        "sku": "COMBO-PROTECCION",
        "name": "Kit Proteccion Total",
        "qty": 50
      }
    ]
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**Errores posibles:**

| HTTP Status | Error Code                  | Causa                     |
| ----------- | --------------------------- | ------------------------- |
| 400         | `COMBO_STOCK_IMPACT_FAILED` | Error al calcular impacto |
| 403         | -                           | Sin permiso `COMBOS:READ` |

---

### 2.9 Crear Venta con Combos (endpoint existente modificado)

| Campo       | Valor                         |
| ----------- | ----------------------------- |
| **Method**  | `POST`                        |
| **URL**     | `/sales` (endpoint existente) |
| **Permiso** | `SALES:CREATE`                |

El DTO `CreateSaleLineDto` ahora acepta `comboId` como alternativa a `productId`.

**Estructura de una linea de venta:**

| Campo        | Tipo     | Requerido | Validaciones    | Notas                                  |
| ------------ | -------- | --------- | --------------- | -------------------------------------- |
| `productId`  | `string` | No\*      | -               | Para venta directa de producto         |
| `comboId`    | `string` | No\*      | -               | Para venta de combo                    |
| `locationId` | `string` | No        | -               | Bodega/ubicacion opcional              |
| `quantity`   | `number` | Si        | > 0 (min 0.01)  | Cantidad                               |
| `salePrice`  | `number` | No\*\*    | > 0 (min 0.01)  | Precio unitario                        |
| `currency`   | `string` | No        | default `"COP"` | Moneda                                 |
| `extra`      | `object` | No        | -               | Datos extra (ej: `{ "discount": 10 }`) |

\* Se debe enviar `productId` O `comboId`, no ambos.
\*\* `salePrice` es requerido para lineas de producto directo. Para lineas de combo se ignora (se usa el precio del combo).

**Ejemplo Request (venta mixta):**

```json
{
  "warehouseId": "wh-123",
  "contactId": "contact-456",
  "customerReference": "Juan Perez",
  "externalReference": "INV-2026-001",
  "note": "Venta mostrador",
  "lines": [
    {
      "comboId": "combo-uuid-123",
      "quantity": 2
    },
    {
      "productId": "prod-individual-01",
      "quantity": 5,
      "salePrice": 15000
    }
  ]
}
```

**Errores adicionales relacionados con combos:**

| HTTP Status | Error Code                | Causa                                   |
| ----------- | ------------------------- | --------------------------------------- |
| 400         | `COMBO_NOT_FOUND`         | El `comboId` no existe                  |
| 400         | `COMBO_INACTIVE_ERROR`    | El combo esta desactivado               |
| 400         | `COMBO_EXPANSION_ERROR`   | Error al expandir componentes del combo |
| 400         | `SALE_INSUFFICIENT_STOCK` | Stock insuficiente de algun componente  |

---

### 2.10 Dashboard: Metricas de Combos

El endpoint de dashboard (`GET /dashboard/metrics`) ahora incluye una seccion `combos` en su respuesta.

**Estructura del campo `combos` en la respuesta del dashboard:**

```json
{
  "combos": {
    "totalActiveCombos": 12,
    "topCombosBySales": [
      {
        "comboId": "combo-uuid-123",
        "sku": "COMBO-VERANO-01",
        "name": "Pack Verano",
        "totalUnitsSold": 150,
        "totalRevenue": 6750000
      }
    ],
    "combosWithZeroAvailability": 3
  }
}
```

**Campos:**

| Campo                               | Tipo                   | Descripcion                                                        |
| ----------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `totalActiveCombos`                 | `number`               | Cantidad de combos activos en la org                               |
| `topCombosBySales`                  | `ITopComboSalesData[]` | Top 5 combos por unidades vendidas                                 |
| `topCombosBySales[].comboId`        | `string`               | ID del combo                                                       |
| `topCombosBySales[].sku`            | `string`               | SKU del combo                                                      |
| `topCombosBySales[].name`           | `string`               | Nombre del combo                                                   |
| `topCombosBySales[].totalUnitsSold` | `number`               | Unidades vendidas                                                  |
| `topCombosBySales[].totalRevenue`   | `number`               | Revenue total                                                      |
| `combosWithZeroAvailability`        | `number`               | Combos activos sin stock disponible (algun componente con stock 0) |

---

## 3. Flujos de Usuario

### 3.1 Crear Combo

1. Navegar a la seccion Inventario > Combos.
2. Click en boton "Crear Combo" (visible solo con permiso `COMBOS:CREATE`).
3. Formulario con campos:
   - **SKU** (text input, requerido, 3-50 chars)
   - **Nombre** (text input, requerido, 2-200 chars)
   - **Descripcion** (textarea, opcional, max 1000 chars)
   - **Precio** (number input, requerido, >= 0)
   - **Moneda** (select, default COP)
   - **Productos componentes** (tabla dinamica):
     - Selector de producto (busqueda/autocomplete de productos existentes)
     - Cantidad (number input, entero >= 1)
     - Boton agregar/eliminar fila
     - Minimo 1 item
4. Al guardar: `POST /inventory/combos`.
5. En exito: redirigir al detalle del combo o al listado con toast de exito.
6. En error: mostrar mensaje de error mapeado por `errorCode`.

### 3.2 Listar Combos

**Columnas de la tabla:**

| Columna  | Campo                | Notas                                   |
| -------- | -------------------- | --------------------------------------- |
| SKU      | `sku`                | -                                       |
| Nombre   | `name`               | -                                       |
| Precio   | `price` + `currency` | Formateado con moneda                   |
| Estado   | `isActive`           | Badge: Activo (verde) / Inactivo (rojo) |
| Items    | `items.length`       | Cantidad de componentes                 |
| Creado   | `createdAt`          | Fecha formateada                        |
| Acciones | -                    | Ver, Editar, Desactivar                 |

**Filtros disponibles:**

- Buscar por nombre (parcial, case-insensitive)
- Buscar por SKU (exacto)
- Filtrar por estado (activo/inactivo/todos)

**Paginacion:** Server-side, usando `page` y `limit`.

### 3.3 Ver Detalle de Combo

Al hacer click en un combo del listado:

- Informacion general: SKU, nombre, descripcion, precio, moneda, estado, fechas.
- Tabla de componentes:
  - Producto (nombre + SKU del producto, obtener via lookup)
  - Cantidad requerida
- **Seccion de disponibilidad**: Llamar a `/inventory/combos/availability?sku=<sku>` para mostrar stock por bodega.
- Acciones: Editar, Desactivar (segun permisos).

### 3.4 Editar Combo

1. Desde el detalle, click en "Editar" (visible solo con `COMBOS:UPDATE`).
2. Formulario prellenado con datos actuales.
3. **SKU deshabilitado** (campo readonly, inmutable).
4. Campos editables: nombre, descripcion, precio, moneda, items.
5. **Items: full replacement.** El formulario muestra los items actuales y el usuario puede agregar/eliminar/modificar. Al guardar se envian TODOS los items.
6. Al guardar: `PUT /inventory/combos/:id`.

### 3.5 Desactivar Combo

1. Desde listado o detalle, click en "Desactivar" (visible solo con `COMBOS:DELETE`).
2. Dialogo de confirmacion: "Esta seguro de desactivar el combo X? No podra venderse hasta que se reactive."
3. Al confirmar: `PATCH /inventory/combos/:id/deactivate`.
4. Actualizar UI (badge cambia a Inactivo).

### 3.6 Consultar Disponibilidad

**Vista dedicada o tab en la seccion de combos.**

**Columnas de la tabla:**

| Columna     | Campo                          |
| ----------- | ------------------------------ |
| SKU         | `sku`                          |
| Nombre      | `name`                         |
| Precio      | `price`                        |
| Estado      | `isActive`                     |
| Bodega      | `availability[].warehouseName` |
| Disponibles | `availability[].available`     |

Cada combo puede tener multiples filas (una por bodega) o mostrar la disponibilidad como sub-tabla expandible.

**Filtros:** nombre, SKU, estado, bodega especifica.

### 3.7 Crear Venta con Combo

**Cambios en el formulario de creacion de venta:**

1. En la seccion de lineas, agregar selector de tipo: "Producto" | "Combo".
2. Si se selecciona "Combo":
   - Mostrar selector/autocomplete de combos activos.
   - El precio se completa automaticamente (readonly, viene del combo).
   - Solo se pide `quantity`.
   - No se pide `salePrice` (se ignora en backend).
3. Si se selecciona "Producto": flujo actual sin cambios.
4. Se pueden mezclar lineas de combo y producto directo en la misma venta.
5. Antes de enviar, validar que el combo este activo (o dejarlo al backend).

### 3.8 Reporte: Ventas por Combo

**Vista de reporte con:**

- Filtros: rango de fechas (dateFrom, dateTo), combo especifico (optional).
- Tabla:

| Columna            | Campo                                  |
| ------------------ | -------------------------------------- |
| SKU                | `sku`                                  |
| Nombre             | `name`                                 |
| Unidades Vendidas  | `totalComboUnitsSold`                  |
| Revenue            | `totalRevenue` (formateado con moneda) |
| Cantidad de Ventas | `salesCount`                           |

### 3.9 Reporte: Impacto en Stock

**Accesible desde el detalle de un producto.**

- Filtros: rango de fechas.
- Visualizacion sugerida:
  - **Resumen**: Venta directa vs. via combos (puede ser un pie chart o barras).
  - `directSalesQty` vs `comboSalesQty` vs `totalQty`
  - **Tabla de desglose por combo**:

| Columna             | Campo  |
| ------------------- | ------ |
| SKU                 | `sku`  |
| Nombre              | `name` |
| Unidades consumidas | `qty`  |

### 3.10 Dashboard: Seccion Combos

Agregar al dashboard existente una seccion/card de combos:

- **KPI card**: Total combos activos (`totalActiveCombos`).
- **KPI card / alerta**: Combos sin stock (`combosWithZeroAvailability`). Si > 0, mostrar con color de alerta.
- **Tabla/lista**: Top 5 combos por ventas:
  - SKU, Nombre, Unidades vendidas, Revenue.

---

## 4. Modelo de Datos (Frontend)

```typescript
// ─── Combo Item ─────────────────────────────────────────────────────────────

interface ComboItemInput {
  productId: string;
  quantity: number; // entero >= 1
}

interface ComboItemResponse {
  id: string;
  productId: string;
  quantity: number;
}

// ─── Combo ──────────────────────────────────────────────────────────────────

interface Combo {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  isActive: boolean;
  orgId: string;
  items: ComboItemResponse[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Create / Update DTOs ───────────────────────────────────────────────────

interface CreateComboRequest {
  sku: string; // 3-50 chars
  name: string; // 2-200 chars
  description?: string; // max 1000 chars
  price: number; // >= 0
  currency?: string; // default "COP"
  items: ComboItemInput[]; // min 1
}

interface UpdateComboRequest {
  name?: string; // 2-200 chars
  description?: string; // max 1000 chars
  price?: number; // >= 0
  currency?: string;
  items?: ComboItemInput[]; // min 1, full replacement
}

// ─── List Query ─────────────────────────────────────────────────────────────

interface GetCombosQuery {
  page?: number; // default 1
  limit?: number; // default 10
  isActive?: boolean;
  name?: string;
  sku?: string;
}

// ─── Availability ───────────────────────────────────────────────────────────

interface ComboWarehouseAvailability {
  warehouseId: string;
  warehouseName: string;
  available: number;
}

interface ComboAvailability {
  id: string;
  sku: string;
  name: string;
  price: number;
  isActive: boolean;
  availability: ComboWarehouseAvailability[];
}

interface GetComboAvailabilityQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  name?: string;
  sku?: string;
  warehouseId?: string;
}

// ─── Sales Report ───────────────────────────────────────────────────────────

interface ComboSalesReportItem {
  comboId: string;
  sku: string;
  name: string;
  totalComboUnitsSold: number;
  totalRevenue: number;
  salesCount: number;
}

interface GetComboSalesReportQuery {
  dateFrom?: string; // ISO date "YYYY-MM-DD"
  dateTo?: string; // ISO date "YYYY-MM-DD"
  comboId?: string;
}

// ─── Stock Impact ───────────────────────────────────────────────────────────

interface ComboBreakdownItem {
  comboId: string;
  sku: string;
  name: string;
  qty: number;
}

interface ComboStockImpact {
  directSalesQty: number;
  comboSalesQty: number;
  totalQty: number;
  comboBreakdown: ComboBreakdownItem[];
}

interface GetComboStockImpactQuery {
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
}

// ─── Sale Line (modificado) ─────────────────────────────────────────────────

interface CreateSaleLineInput {
  productId?: string; // para venta directa
  comboId?: string; // para venta de combo
  locationId?: string;
  quantity: number; // > 0
  salePrice?: number; // requerido para producto, ignorado para combo
  currency?: string;
  extra?: Record<string, unknown>;
}

// ─── Dashboard Combos ───────────────────────────────────────────────────────

interface TopComboSalesData {
  comboId: string;
  sku: string;
  name: string;
  totalUnitsSold: number;
  totalRevenue: number;
}

interface DashboardCombosData {
  totalActiveCombos: number;
  topCombosBySales: TopComboSalesData[];
  combosWithZeroAvailability: number;
}

// ─── Pagination (compartido) ────────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── API Response Envelopes ─────────────────────────────────────────────────

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiPaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  error: {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 5. Estados y Validaciones

### 5.1 Validaciones del Formulario de Creacion

| Campo               | Regla                          | Mensaje sugerido                                  |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| `sku`               | Requerido, string, 3-50 chars  | "El SKU es obligatorio (3-50 caracteres)"         |
| `name`              | Requerido, string, 2-200 chars | "El nombre es obligatorio (2-200 caracteres)"     |
| `description`       | Opcional, max 1000 chars       | "La descripcion no puede superar 1000 caracteres" |
| `price`             | Requerido, number, >= 0        | "El precio debe ser un numero positivo o cero"    |
| `currency`          | Opcional, string               | -                                                 |
| `items`             | Array, min 1 elemento          | "Debe agregar al menos un producto al combo"      |
| `items[].productId` | Requerido, string              | "Seleccione un producto"                          |
| `items[].quantity`  | Requerido, entero >= 1         | "La cantidad debe ser al menos 1"                 |

### 5.2 Validaciones del Formulario de Edicion

Mismas que creacion excepto:

- `sku`: **NO editable** (campo deshabilitado).
- Todos los campos son opcionales (partial update).

### 5.3 Estados de UI

| Estado        | Cuando aplica                               | Comportamiento                                         |
| ------------- | ------------------------------------------- | ------------------------------------------------------ |
| **Loading**   | Cargando lista/detalle/reportes             | Skeleton/spinner                                       |
| **Empty**     | Lista sin resultados                        | Mensaje "No hay combos" + CTA crear                    |
| **Error**     | Error de API                                | Toast/banner con mensaje mapeado                       |
| **Success**   | Operacion exitosa (crear/editar/desactivar) | Toast de exito                                         |
| **Forbidden** | Sin permisos                                | Ocultar botones/secciones, 403 redirige a "sin acceso" |

### 5.4 Permisos y UI Condicional

| Permiso         | Elementos visibles                                               |
| --------------- | ---------------------------------------------------------------- |
| `COMBOS:CREATE` | Boton "Crear Combo"                                              |
| `COMBOS:READ`   | Seccion Combos en menu, lista, detalle, disponibilidad, reportes |
| `COMBOS:UPDATE` | Boton "Editar" en detalle                                        |
| `COMBOS:DELETE` | Boton "Desactivar" en detalle y listado                          |

Si el usuario NO tiene `COMBOS:READ`, la seccion de combos no deberia aparecer en la navegacion.

---

## 6. Integracion con Modulos Existentes

### 6.1 Formulario de Creacion de Venta

**Cambio requerido en el formulario de lineas de venta:**

1. Agregar un toggle/select de tipo de linea: `"producto"` | `"combo"`.
2. Cuando es `"combo"`:
   - Mostrar un autocomplete/select de combos (filtrar solo activos).
   - Al seleccionar un combo, mostrar su precio automaticamente.
   - Ocultar o deshabilitar el campo `salePrice` (el backend usa el precio del combo).
   - Mostrar la cantidad de items del combo como referencia.
3. Cuando es `"producto"`: flujo actual sin modificaciones.
4. Una venta puede tener mezcla de lineas combo + producto.

### 6.2 Dashboard

Agregar una nueva seccion/tarjeta al dashboard existente:

- Card "Combos Activos" con `totalActiveCombos`.
- Card "Sin Stock" con `combosWithZeroAvailability` (color rojo/naranja si > 0).
- Mini-tabla o lista "Top Combos" con los top 5.

### 6.3 Navegacion

Agregar entrada en el menu lateral:

- Inventario > **Combos** (requiere `COMBOS:READ`)
  - Submenu o tabs: Lista | Disponibilidad | Reportes

---

## 7. Edge Cases y UX

### 7.1 Combo sin stock (disponibilidad 0)

- **Causa**: Al menos un componente tiene stock 0 en todas las bodegas.
- **UX**: En la vista de disponibilidad, mostrar `available: 0` con indicador visual (rojo, icono de alerta).
- **En el formulario de venta**: Permitir seleccionar el combo pero mostrar advertencia de que no hay stock. El backend rechazara con `SALE_INSUFFICIENT_STOCK`.

### 7.2 Producto componente desactivado

- **Causa**: Un producto que forma parte del combo fue desactivado.
- **UX**: En el detalle del combo, mostrar el producto componente con indicador de "inactivo". Considerar mostrar alerta: "Este combo tiene componentes inactivos".
- **Impacto**: El combo seguira apareciendo pero no se podra vender si el producto desactivado no tiene stock.

### 7.3 Venta mixta (combo + productos directos)

- **UX**: La tabla de lineas de venta debe diferenciar visualmente las lineas de combo (icono/badge "COMBO") de las lineas de producto directo.
- **En el resumen de la venta**: Mostrar totales desglosados.

### 7.4 Combo con muchos componentes

- **UX**: Si un combo tiene mas de ~5 items, considerar mostrar los items colapsados con opcion de expandir.
- **En la disponibilidad**: El componente limitante (bottleneck) determina la disponibilidad total.

### 7.5 Edicion de items (full replacement)

- **UX critica**: Dejar MUY claro al usuario que al editar los items se reemplazan TODOS. Considerar un warning: "Los productos del combo se reemplazaran completamente con esta lista".
- **Pattern**: Cargar los items actuales en el formulario y permitir agregar/eliminar/modificar.

### 7.6 SKU inmutable

- **UX**: En edicion, mostrar el SKU como campo readonly con icono de candado. Tooltip: "El SKU no se puede modificar despues de la creacion".

### 7.7 Concurrencia en stock

- **Escenario**: El usuario ve disponibilidad de 5 combos, pero al intentar vender 5 ya no hay stock porque otra venta consumio stock entre medio.
- **UX**: Mostrar el error `SALE_INSUFFICIENT_STOCK` con mensaje claro: "Stock insuficiente. La disponibilidad pudo haber cambiado. Refresque y vuelva a intentar."

### 7.8 Codigos de error para mapeo en frontend

| Error Code                  | Mensaje sugerido al usuario                        |
| --------------------------- | -------------------------------------------------- |
| `COMBO_NOT_FOUND`           | "El combo no fue encontrado"                       |
| `COMBO_SKU_CONFLICT`        | "Ya existe un combo con ese SKU"                   |
| `COMBO_CREATION_ERROR`      | "Error al crear el combo. Intente nuevamente"      |
| `COMBO_UPDATE_ERROR`        | "Error al actualizar el combo. Intente nuevamente" |
| `COMBO_DEACTIVATE_ERROR`    | "Error al desactivar el combo"                     |
| `COMBO_PRODUCT_NOT_FOUND`   | "Uno o mas productos no fueron encontrados"        |
| `COMBO_SKU_IMMUTABLE`       | "El SKU del combo no se puede modificar"           |
| `COMBO_AVAILABILITY_FAILED` | "Error al consultar disponibilidad"                |
| `COMBO_EXPANSION_ERROR`     | "Error al procesar los componentes del combo"      |
| `COMBO_INACTIVE_ERROR`      | "El combo esta desactivado y no se puede vender"   |
| `COMBO_SALES_REPORT_FAILED` | "Error al generar el reporte de ventas"            |
| `COMBO_STOCK_IMPACT_FAILED` | "Error al calcular el impacto en stock"            |

---

## Apendice: Resumen de Permisos

| Constante                          | Valor             | Uso                                           |
| ---------------------------------- | ----------------- | --------------------------------------------- |
| `SYSTEM_PERMISSIONS.COMBOS_CREATE` | `"COMBOS:CREATE"` | Crear combos                                  |
| `SYSTEM_PERMISSIONS.COMBOS_READ`   | `"COMBOS:READ"`   | Listar, ver detalle, disponibilidad, reportes |
| `SYSTEM_PERMISSIONS.COMBOS_UPDATE` | `"COMBOS:UPDATE"` | Editar combos                                 |
| `SYSTEM_PERMISSIONS.COMBOS_DELETE` | `"COMBOS:DELETE"` | Desactivar combos                             |
