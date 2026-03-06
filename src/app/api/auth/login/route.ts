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

    const { accessToken, refreshToken, ...rest } = result.data;

    // Set HttpOnly cookies
    await setAuthCookies(accessToken, refreshToken);

    // Return everything except tokens to the browser
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
