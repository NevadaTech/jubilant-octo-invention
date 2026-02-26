export function uniqueName(prefix: string): string {
  return `E2E-${prefix}-${Date.now()}`;
}

export function uniqueSku(): string {
  return `E2E-SKU-${Date.now()}`;
}

export function uniqueEmail(): string {
  return `e2e-${Date.now()}@test.com`;
}

export function uniqueCode(): string {
  const short = Date.now().toString(36).slice(-5).toUpperCase();
  return `E2E${short}`;
}
