import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromCookie,
  clearAuthCookies,
} from "@/app/api/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromCookie();
    const organizationSlug =
      request.headers.get("X-Organization-Slug") ?? undefined;

    if (accessToken) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      if (organizationSlug) {
        headers["X-Organization-Slug"] = organizationSlug;
      }

      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers,
      }).catch(() => {
        // Best effort — clear cookies regardless
      });
    }

    await clearAuthCookies();

    return NextResponse.json({ success: true });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
