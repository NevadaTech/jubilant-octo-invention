import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/app/api/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationSlug, email, password } = body;

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-Slug": organizationSlug,
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    const {
      refreshToken,
      accessToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      ...rest
    } = result.data;

    // Both tokens live only in HttpOnly cookies (protected from JS access).
    // Browser API calls go through the same-origin /api/proxy route, which
    // reads the access-token cookie server-side.
    // Cookie maxAge is derived from the backend-issued expiry timestamps so
    // the browser keeps the cookies alive exactly as long as the JWT is valid.
    await setAuthCookies(
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    );

    // Return the expiry (the browser schedules refresh with it) but no token.
    return NextResponse.json({
      ...result,
      data: { ...rest, accessTokenExpiresAt },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
