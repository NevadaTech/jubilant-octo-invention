// Uploads pass through a Vercel function (/api/proxy) whose request body is capped at ~4.5 MB.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
