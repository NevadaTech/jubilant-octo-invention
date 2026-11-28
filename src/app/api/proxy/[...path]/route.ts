import { NextRequest } from "next/server";
import { getAccessTokenFromCookie } from "@/app/api/auth/cookies";
import { proxyToBackend } from "@/shared/infrastructure/http/api-proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Report exports can take a while on the backend.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path, {
    apiUrl: API_URL,
    accessToken: await getAccessTokenFromCookie(),
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
