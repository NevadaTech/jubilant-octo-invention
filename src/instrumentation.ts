// Next.js instrumentation hook for Sentry
// To enable: npm install @sentry/nextjs, rename this to instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
}
