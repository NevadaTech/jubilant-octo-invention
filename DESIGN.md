---
name: Nevada Inventory
description: Interfaz operativa para controlar inventario, ventas y permisos dentro de la empresa activa.
colors:
  nevada-blue: "oklch(47% 0.13 255)"
  nevada-blue-soft: "oklch(93% 0.032 255)"
  nevada-ink: "oklch(18% 0.012 250)"
  nevada-muted: "oklch(50% 0.02 250)"
  nevada-paper: "oklch(99% 0.002 250)"
  nevada-card: "oklch(100% 0 0)"
  nevada-line: "oklch(91% 0.008 250)"
  nevada-success: "oklch(47% 0.12 145)"
  nevada-success-soft: "oklch(93% 0.04 145)"
  nevada-warning: "oklch(47% 0.12 85)"
  nevada-warning-soft: "oklch(93% 0.04 85)"
  nevada-danger: "oklch(60% 0.2 25)"
  nevada-danger-soft: "oklch(93% 0.04 25)"
  focus-ring: "oklch(55% 0.14 255)"
  modal-scrim: "rgb(0 0 0 / 0.8)"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  control: "40px"
components:
  button-primary:
    backgroundColor: "{colors.nevada-blue}"
    textColor: "oklch(99% 0.005 255)"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "{spacing.control}"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "oklch(47% 0.13 255 / 0.9)"
    textColor: "oklch(99% 0.005 255)"
    rounded: "{rounded.md}"
    height: "{spacing.control}"
  button-outline:
    backgroundColor: "{colors.nevada-card}"
    textColor: "{colors.nevada-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "{spacing.control}"
    typography: "{typography.title}"
  button-destructive:
    backgroundColor: "{colors.nevada-danger}"
    textColor: "oklch(99% 0.005 25)"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "{spacing.control}"
    typography: "{typography.title}"
  input:
    backgroundColor: "{colors.nevada-paper}"
    textColor: "{colors.nevada-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "{spacing.control}"
    typography: "{typography.body}"
  chip-status:
    backgroundColor: "{colors.nevada-success-soft}"
    textColor: "{colors.nevada-success}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.nevada-card}"
    textColor: "{colors.nevada-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  nav-active:
    backgroundColor: "{colors.nevada-blue-soft}"
    textColor: "oklch(40% 0.11 255)"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    typography: "{typography.title}"
---

# Design System: Nevada Inventory

## Overview

**Creative North Star: "El libro de bodega"**

Nevada es una herramienta de trabajo, no una vitrina. La pantalla se lee como un libro de bodega: título, dato, estado y una sola acción que sigue. El azul Nevada marca lo que se puede pulsar y lo que está activo. El resto permanece en papel claro y tinta oscura para que el inventario, la venta o el permiso se vean antes que la marca.

La densidad es la de una aplicación de escritorio usada entre la bodega y la oficina. Las listas caben en una vista. El texto explicativo aparece solo cuando la acción cambia el stock o no se puede deshacer. En el móvil, la misma información pasa a tarjetas. El nombre visible es Nevada.

**Key Characteristics:**

- Una acción principal por vista, en azul Nevada.
- El estado se lee en palabras. El color lo acompaña.
- Etiquetas siempre visibles. Ningún control depende solo de un icono.
- El error va en texto, junto al campo.
- El diálogo confirma sobre un velo negro y el botón que confirma queda enfocado.

## Colors

La paleta es un azul frío de trabajo sobre grises pizarra. El color fuerte se reserva para la acción, el ítem activo y el foco.

### Primary

- **Azul Nevada** (`nevada-blue`): botones que ejecutan la acción principal, la marca compacta del lateral y los enlaces de acción.
- **Azul Nevada suave** (`nevada-blue-soft`): fondo del ítem de menú activo y de las filas o avisos que pertenecen a esa acción.

### Neutral

- **Tinta** (`nevada-ink`): títulos, valores y etiquetas.
- **Tinta secundaria** (`nevada-muted`): metadatos, placeholders y ayuda breve.
- **Papel** (`nevada-paper`): fondo de la aplicación.
- **Ficha** (`nevada-card`): tarjetas, diálogos y filas.
- **Línea** (`nevada-line`): bordes de campos, tarjetas y divisores.
- **Velo del diálogo** (`modal-scrim`): fondo del modal, negro al 80 %.

### Semantic

- **Hecho** (`nevada-success` sobre `nevada-success-soft`): estado resuelto, como Recibido, Confirmada o Activo.
- **Pendiente** (`nevada-warning` sobre `nevada-warning-soft`): aviso antes de una acción que cambia stock.
- **Peligro** (`nevada-danger` sobre `nevada-danger-soft`): eliminar, anular, desactivar, cancelar y el error de validación.
- **Anillo de foco** (`focus-ring`): contorno del control enfocado.

**The One Voice Rule.** En una vista solo el botón principal usa el azul sólido. Cancelar, filtros y acciones secundarias quedan en ficha con línea.

**The Words First Rule.** Un estado no se comunica solo con color. La palabra va dentro de la pastilla.

## Typography

**Display Font:** Inter
**Body Font:** Inter
**Label/Mono Font:** JetBrains Mono, para SKU, códigos y referencias

**Character:** Inter lleva la interfaz en un tamaño de trabajo. JetBrains Mono distingue identificadores de la prosa.

### Hierarchy

- **Headline** (700, 1.5rem): título de la página.
- **Title** (600, 0.875rem): nombre de fila, etiqueta de campo y botón.
- **Body** (400, 0.875rem): valores, ayuda y texto de diálogo.
- **Label** (600, 0.75rem): pastillas de estado y rótulos pequeños.
- **Mono** (500, 0.875rem): SKU, código de barras y números de documento.

**The Plain Case Rule.** Los botones y los estados van en el castellano de la interfaz, con mayúscula inicial. No se ponen en mayúsculas sostenidas.

## Layout

Escritorio a 1440 px. El lateral fijo lista Panel y, bajo el grupo Inventario, Productos, Categorías, Combos, Marcas, Almacenes, Movimientos, Transferencias y Stock. El resto del menú cuelga al mismo nivel: Ventas, Devoluciones, Contactos, Reportes, Importaciones, Integraciones, Usuarios, Roles, Auditoría y Configuración. Inventario es el único grupo que se abre y se cierra.

El contenido usa un ritmo de 24 px alrededor y 16 px entre bloques. La empresa activa permanece visible en el encabezado. Por debajo del quiebre de escritorio, el lateral se cierra detrás del botón Menú y las tablas pasan a tarjetas de 390 px de ancho.

**The Company Scope Rule.** Si el alcance es Todas las Empresas, la pantalla lo dice y no ofrece crear ventas, movimientos, transferencias ni devoluciones.

## Elevation & Depth

La profundidad es por capas de tono, no por sombra. El papel queda detrás, la ficha blanca encima y el borde de línea separa. La sombra aparece en el menú flotante y en el panel móvil. El diálogo no flota sobre la página en blanco: tapa la aplicación con el velo negro y centra la ficha.

### Shadow Vocabulary

- **Menú flotante** (`box-shadow: 0 4px 6px rgb(0 0 0 / 0.1)`): listas desplegables y el botón que abre el menú en móvil.

**The Flat Work Surface Rule.** Listas, formularios y fichas de detalle no llevan sombra en reposo.

## Shapes

Las esquinas son cortas y constantes. El control y el botón usan 6 px. La tarjeta y el ítem de menú usan 8 px. La pastilla de estado es una píldora. No hay esquinas recortadas ni marcos decorativos.

## Components

### Buttons

- **Shape:** esquinas de 6 px, alto de 40 px.
- **Primary:** fondo azul Nevada, texto casi blanco. Es la única acción que completa la vista.
- **Hover / Focus:** el primario baja un poco la opacidad. El foco visible es un anillo de 2 px en el color de foco, separado 2 px del control.
- **Outline:** ficha blanca, línea neutra. Sirve para Cancelar y para acciones secundarias.
- **Destructive:** fondo de peligro. Reservado a eliminar, anular, desactivar y cancelar.

### Chips

- **Style:** píldora con fondo suave y texto del mismo tono semántico.
- **State:** la palabra nombra el estado. Activo y Confirmada usan hecho. Borrador usa papel y tinta secundaria. El peligro usa el tono de peligro.

### Cards / Containers

- **Corner Style:** 8 px.
- **Background:** ficha blanca.
- **Shadow Strategy:** ninguna en reposo.
- **Border:** línea neutra de 1 px.
- **Internal Padding:** 24 px en una ficha de página. 12 px a 16 px en una fila.

### Inputs / Fields

- **Style:** alto de 40 px, fondo papel, borde línea, esquinas de 6 px. La etiqueta va encima, siempre visible.
- **Focus:** anillo de 2 px en el color de foco.
- **Error:** el borde y el anillo pasan al tono de error, con un halo suave del mismo tono. El mensaje queda debajo del campo, en texto.

### Navigation

- **Style:** ítem de 14 px, icono de 20 px y texto. Activo en azul suave con tinta azul. Inactivo en tinta secundaria.
- **Submenu:** solo Inventario. Abierto, sus ocho entradas se indentan con una línea a la izquierda.
- **Mobile:** el mismo menú entra por el botón Menú. Cerrar el cajón es una acción con texto.

### Dialog

- **Style:** velo negro al 80 % sobre toda la aplicación. La ficha blanca queda centrada, con título, una frase de consecuencia y las acciones al final, alineadas a la derecha.
- **Focus:** al abrir, el foco está en el botón que confirma. Cancelar no lleva el anillo.

## Do's and Don'ts

### Do

- **Do** dejar una sola acción primaria por vista.
- **Do** escribir el estado, el error y la consecuencia de una acción irreversible.
- **Do** mostrar la empresa activa en el encabezado.
- **Do** usar JetBrains Mono para SKU y códigos.
- **Do** abrir un modal con velo negro cuando la acción no se puede deshacer.

### Don't

- **Don't** usar un botón que sea solo un icono.
- **Don't** comunicar un estado únicamente con color.
- **Don't** poner un párrafo de ayuda en una lista que ya se entiende.
- **Don't** tratar la pantalla como una página de marketing.
- **Don't** sacar Empresas al menú lateral. Vive en Configuración, pestaña Organización, cuando la organización tiene varias empresas.
