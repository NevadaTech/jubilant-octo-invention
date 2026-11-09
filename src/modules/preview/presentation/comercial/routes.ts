import type { Route } from "next";

function route(path: string): Route {
  return path as Route;
}

export function previewSalePath(id: string): Route {
  return route(`/preview/comercial/ventas/${id}`);
}
