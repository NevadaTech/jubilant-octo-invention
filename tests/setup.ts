import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/dom";

// Tailwind no se carga en jsdom. Tratamos el viewport de las pruebas como
// escritorio: `hidden` se oculta y los breakpoints sm/md/lg lo vuelven a mostrar.
// getByRole sí respeta display; getByText no, así que las copias móviles
// (`sm:hidden`, `md:hidden`, `lg:hidden`) se excluyen de las búsquedas por texto.
configure({
  defaultIgnore:
    'script, style, [class~="md:hidden"], [class~="md:hidden"] *, [class~="lg:hidden"], [class~="lg:hidden"] *',
});

const responsiveStyle = document.createElement("style");
responsiveStyle.textContent = `
  .hidden { display: none !important; }
  [class~="sm:hidden"] { display: none !important; }
  [class~="sm:block"] { display: block !important; }
  [class~="sm:flex"] { display: flex !important; }
  [class~="sm:inline-flex"] { display: inline-flex !important; }
  [class~="sm:grid"] { display: grid !important; }
  [class~="sm:table"] { display: table !important; }
  [class~="md:hidden"] { display: none !important; }
  [class~="md:block"] { display: block !important; }
  [class~="md:flex"] { display: flex !important; }
  [class~="md:inline-flex"] { display: inline-flex !important; }
  [class~="md:grid"] { display: grid !important; }
  [class~="md:table"] { display: table !important; }
  [class~="lg:hidden"] { display: none !important; }
  [class~="lg:block"] { display: block !important; }
  [class~="lg:flex"] { display: flex !important; }
  [class~="lg:inline-flex"] { display: inline-flex !important; }
  [class~="lg:inline"] { display: inline !important; }
  [class~="lg:grid"] { display: grid !important; }
  [class~="lg:table"] { display: table !important; }
  [class~="lg:table-row"] { display: table-row !important; }
  [class~="lg:table-row-group"] { display: table-row-group !important; }
  [class~="lg:table-header-group"] { display: table-header-group !important; }
  [class~="lg:table-cell"] { display: table-cell !important; }
`;
document.head.appendChild(responsiveStyle);

// jsdom does not implement window.matchMedia — provide a minimal stub.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom 28 + Node.js 22+ has a broken localStorage (object exists but methods are undefined).
// Provide a proper in-memory implementation.
if (
  typeof globalThis.localStorage === "undefined" ||
  typeof globalThis.localStorage.setItem !== "function"
) {
  const storage = new Map<string, string>();
  const localStorageImpl = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    get length() {
      return storage.size;
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageImpl,
    writable: true,
    configurable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
      value: localStorageImpl,
      writable: true,
      configurable: true,
    });
  }
}
