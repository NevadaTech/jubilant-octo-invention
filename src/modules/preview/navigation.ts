import type { Route } from "next";

function route(path: string): Route {
  return path as Route;
}

export const previewIndexPath = route("/preview");

export function previewProductPath(sku: string): Route {
  return route(`/preview/catalogo/productos/${sku}`);
}

export const previewScreens = {
  acceso: { label: "Acceso", href: route("/preview/acceso") },
  panel: { label: "Panel", href: route("/preview/panel") },
  productos: {
    label: "Productos",
    href: route("/preview/catalogo/productos"),
  },
  productoNuevo: {
    label: "Nuevo producto",
    href: route("/preview/catalogo/productos/nuevo"),
  },
  categorias: {
    label: "Categorías",
    href: route("/preview/catalogo/categorias"),
  },
  combos: { label: "Combos", href: route("/preview/catalogo/combos") },
  marcas: { label: "Marcas", href: route("/preview/catalogo/marcas") },
  almacenes: {
    label: "Almacenes",
    href: route("/preview/operaciones/almacenes"),
  },
  movimientos: {
    label: "Movimientos",
    href: route("/preview/operaciones/movimientos"),
  },
  transferencias: {
    label: "Transferencias",
    href: route("/preview/operaciones/transferencias"),
  },
  stock: { label: "Stock", href: route("/preview/operaciones/stock") },
  ventas: { label: "Ventas", href: route("/preview/comercial/ventas") },
  devoluciones: {
    label: "Devoluciones",
    href: route("/preview/comercial/devoluciones"),
  },
  contactos: {
    label: "Contactos",
    href: route("/preview/comercial/contactos"),
  },
  reportes: { label: "Reportes", href: route("/preview/datos/reportes") },
  importaciones: {
    label: "Importaciones",
    href: route("/preview/datos/importaciones"),
  },
  integraciones: {
    label: "Integraciones",
    href: route("/preview/datos/integraciones"),
  },
  usuarios: { label: "Usuarios", href: route("/preview/admin/usuarios") },
  roles: { label: "Roles", href: route("/preview/admin/roles") },
  auditoria: { label: "Auditoría", href: route("/preview/admin/auditoria") },
  configuracion: {
    label: "Configuración",
    href: route("/preview/admin/configuracion"),
  },
} as const;

export const previewNav = [
  { ...previewScreens.panel, type: "link" as const, icon: "panel" as const },
  {
    type: "group" as const,
    label: "Inventario",
    icon: "inventario" as const,
    children: [
      previewScreens.productos,
      previewScreens.categorias,
      previewScreens.combos,
      previewScreens.marcas,
      previewScreens.almacenes,
      previewScreens.movimientos,
      previewScreens.transferencias,
      previewScreens.stock,
    ],
  },
  { ...previewScreens.ventas, type: "link" as const, icon: "ventas" as const },
  {
    ...previewScreens.devoluciones,
    type: "link" as const,
    icon: "devoluciones" as const,
  },
  {
    ...previewScreens.contactos,
    type: "link" as const,
    icon: "contactos" as const,
  },
  {
    ...previewScreens.reportes,
    type: "link" as const,
    icon: "reportes" as const,
  },
  {
    ...previewScreens.importaciones,
    type: "link" as const,
    icon: "importaciones" as const,
  },
  {
    ...previewScreens.integraciones,
    type: "link" as const,
    icon: "integraciones" as const,
  },
  {
    ...previewScreens.usuarios,
    type: "link" as const,
    icon: "usuarios" as const,
  },
  { ...previewScreens.roles, type: "link" as const, icon: "roles" as const },
  {
    ...previewScreens.auditoria,
    type: "link" as const,
    icon: "auditoria" as const,
  },
  {
    ...previewScreens.configuracion,
    type: "link" as const,
    icon: "configuracion" as const,
  },
] as const;

export const previewIndexSections = [
  { title: "Acceso", links: [previewScreens.acceso] },
  { title: "Panel", links: [previewScreens.panel] },
  {
    title: "Catálogo",
    links: [
      previewScreens.productos,
      previewScreens.productoNuevo,
      previewScreens.categorias,
      previewScreens.combos,
      previewScreens.marcas,
    ],
  },
  {
    title: "Operaciones",
    links: [
      previewScreens.almacenes,
      previewScreens.movimientos,
      previewScreens.transferencias,
      previewScreens.stock,
    ],
  },
  {
    title: "Comercial",
    links: [
      previewScreens.ventas,
      previewScreens.devoluciones,
      previewScreens.contactos,
    ],
  },
  {
    title: "Datos",
    links: [
      previewScreens.reportes,
      previewScreens.importaciones,
      previewScreens.integraciones,
    ],
  },
  {
    title: "Administración",
    links: [
      previewScreens.usuarios,
      previewScreens.roles,
      previewScreens.auditoria,
      previewScreens.configuracion,
    ],
  },
] as const;

export function isPreviewNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
