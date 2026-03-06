import { NextRequest, NextResponse } from "next/server";
import {
  getRefreshTokenFromCookie,
  setAuthCookies,
  clearAuthCookies,
} from "../cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshTokenFromCookie();
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 },
      );
    }

    const organizationSlug =
      request.headers.get("X-Organization-Slug") ?? undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (organizationSlug) {
      headers["X-Organization-Slug"] = organizationSlug;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      await clearAuthCookies();
      return NextResponse.json(result, { status: response.status });
    }

    const data = result.data || result;

    // Update HttpOnly cookies
    await setAuthCookies(data.accessToken, data.refreshToken);

    // Return data without tokens
    const { accessToken: _at, refreshToken: _rt, ...rest } = data;
    return NextResponse.json({
      success: true,
      data: rest,
    });
  } catch {
    await clearAuthCookies();
    return NextResponse.json(
      { success: false, message: "Refresh failed" },
      { status: 500 },
    );
  }
}
