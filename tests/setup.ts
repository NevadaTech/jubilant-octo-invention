import "@testing-library/jest-dom/vitest";

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
