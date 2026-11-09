# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

No hay un usuario principal. Tres audiencias usan el mismo producto con el mismo peso:

- **Operación.** Trabaja el inventario en el día a día: stock, movimientos, transferencias y almacenes.
- **Comercial.** Registra ventas, devoluciones y contactos (clientes, proveedores o ambos).
- **Administración.** Gestiona usuarios, roles, permisos, auditoría, empresas y configuración.

Cada persona entra a una organización y solo actúa dentro de los permisos de su rol.

## Product Purpose

Nevada Inventory es el frontend web del sistema de inventario de Nevada. Sirve para que una organización controle productos, almacenes, stock, movimientos, transferencias, ventas, devoluciones, contactos, reportes e importaciones, siempre dentro del alcance de su organización y de la empresa activa.

Existe para que ese trabajo quede bajo control: la acción relevante pasa por un flujo con estados y queda sujeta a permisos y a auditoría.

El éxito es que operación, comercial y administración terminen su trabajo dentro de esos flujos, y que administración pueda reconstruir qué ocurrió. No hay métricas numéricas de éxito confirmadas.

## Positioning

El control operativo es la diferencia. Nevada no se distingue por “tener inventario”, sino por permisos granulares, un registro de auditoría y flujos con estados (borrador, confirmado, anulado, y los estados propios de cada proceso).

La multi-empresa y la sincronización con tiendas existen en el producto. No son el posicionamiento confirmado.

## Operating Context

- Aplicación web de escritorio, usada en el navegador. No es una app nativa.
- Idioma de trabajo principal: español. Inglés también está soportado.
- El acceso es por organización, correo y contraseña, contra un backend NestJS existente.
- Dentro de la organización, un selector de empresa acota el catálogo, el stock, las ventas, las devoluciones, los movimientos, los reportes y el panel. Las altas que pertenecen a una empresa exigen una empresa seleccionada.
- El trabajo mezcla bodega y oficina: catálogo, entradas y salidas, transferencias entre almacenes, ventas, devoluciones, reportes y carga masiva por Excel o CSV.
- La sesión avisa y cierra por inactividad.

## Capabilities and Constraints

Funciones que el producto ya tiene:

- Multi-tenant por organización y multi-empresa dentro de la organización.
- Control de acceso por permisos granulares. La navegación y las acciones respetan esos permisos.
- Flujos con estados: movimientos (borrador, publicado, anulado), transferencias (borrador, en tránsito, recibido) y ventas (borrador, confirmada, picking, enviada, completada).
- Auditoría de actividad, con exportación.
- Catálogo (productos, categorías, combos, marcas), almacenes, stock, contactos, panel de métricas, reportes con exportación a Excel e importación masiva desde Excel o CSV.
- Integración con VTEX como capacidad existente, no como posicionamiento.

Restricciones que el trabajo futuro conserva:

- Sigue siendo el frontend del backend NestJS. Ese contrato no se reemplaza.
- Web de escritorio. No se trata como app iOS o Android.
- Español es el idioma de trabajo. El inglés se mantiene.
- Accesibilidad operativa: etiquetas siempre visibles, errores en texto junto al campo, contraste suficiente y foco visible. Un control no puede depender solo de un icono.

Decisiones abiertas:

- No hay un estándar de accesibilidad nombrado (por ejemplo un nivel WCAG). Rige lo confirmado arriba.
- No hay métricas numéricas de éxito.

## Brand Commitments

- El producto se llama Nevada Inventory.
- En la interfaz el nombre visible es Nevada.
- No hay voz, personalidad ni referencias visuales declaradas como vinculantes.

## Evidence on Hand

- `README.md` y `README.es.md` describen el producto y sus módulos.
- `designs/briefs/` guarda briefs de pantallas (acceso, panel, catálogo, operaciones, comercial, datos, administración). Son especificaciones de interfaz, no testimonios.
- Los nombres de ejemplo en esos briefs, como “Ana Pérez” o “Nevada Retail”, son datos de maqueta. No son clientes, casos ni prensa.
- No hay testimonios, casos de estudio, precios publicados ni licencias de cliente que se puedan citar. No se fabrican.

## Product Principles

1. Operación, comercial y administración pesan igual. Ninguna superficie se diseña como si solo existiera un rol.
2. El control es el producto: permisos, estados del flujo y auditoría se conservan aunque una tarea parezca más rápida sin ellos.
3. Toda cifra y toda acción viven dentro de una organización y, cuando aplica, de una empresa. El alcance no se da por sentado.
4. El trabajo es en español, en web de escritorio, contra el backend NestJS que ya existe.
5. La interfaz se opera sin adivinar: la etiqueta, el error y el foco están en el control, no solo en el color o en un icono.

## Accessibility & Inclusion

Requisito confirmado, sin un nivel WCAG nombrado: etiquetas siempre visibles, errores en texto, contraste suficiente y foco visible. Los controles no pueden ser solo un icono. El idioma de trabajo principal es español, con inglés disponible.
