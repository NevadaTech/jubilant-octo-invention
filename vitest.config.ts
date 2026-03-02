import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.spec.ts", "tests/**/*.spec.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
        "src/**/index.ts",
        "src/**/*.spec.*",
        "src/app/**",
        "src/**/application/dto/**",
        "src/**/application/ports/**",
        "src/i18n/**",
        "src/proxy.ts",
        "src/instrumentation.ts",
        "src/ui/primitives/**",
        "src/ui/layout/**",
        "src/ui/forms/**",
        "src/ui/components/dialog.tsx",
        "src/ui/components/tabs.tsx",
        "src/ui/components/select.tsx",
        "src/ui/components/table.tsx",
        "src/ui/components/spinner.tsx",
        "src/ui/components/placeholder.tsx",
        "src/ui/lib/slot.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
});
