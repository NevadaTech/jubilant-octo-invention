import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "../cookies";

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

    const { refreshToken, ...rest } = result.data;

    // Store refresh token in HttpOnly cookie (protected from JS access)
    // Access token is returned to the browser for API requests to the backend
    await setAuthCookies(result.data.accessToken, refreshToken);

    // Return data WITH accessToken (needed for backend API calls) but WITHOUT refreshToken
    return NextResponse.json({
      ...result,
      data: rest,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
