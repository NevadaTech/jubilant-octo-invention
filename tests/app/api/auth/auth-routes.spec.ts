import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { mockSetAuthCookies, mockClearAuthCookies, mockGetRefreshToken } =
  vi.hoisted(() => ({
    mockSetAuthCookies: vi.fn(),
    mockClearAuthCookies: vi.fn(),
    mockGetRefreshToken: vi.fn(),
  }));

vi.mock("@/app/api/auth/cookies", () => ({
  setAuthCookies: mockSetAuthCookies,
  clearAuthCookies: mockClearAuthCookies,
  getRefreshTokenFromCookie: mockGetRefreshToken,
  getAccessTokenFromCookie: vi.fn(),
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as refresh } from "@/app/api/auth/refresh/route";

const tokens = {
  accessToken: "access-jwt",
  refreshToken: "refresh-jwt",
  accessTokenExpiresAt: "2030-01-01T00:00:00.000Z",
  refreshTokenExpiresAt: "2030-02-01T00:00:00.000Z",
};

function backendOk(data: unknown) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("BFF auth routes keep tokens out of the browser", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Given: a successful login When: the BFF responds Then: tokens go to cookies and the body has neither token", async () => {
    fetchMock.mockResolvedValue(
      backendOk({ ...tokens, user: { id: "u1", email: "a@b.c" } }),
    );
    const request = new NextRequest("https://app.example.com/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        organizationSlug: "acme",
        email: "a@b.c",
        password: "secret",
      }),
    });

    const response = await login(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockSetAuthCookies).toHaveBeenCalledWith(
      "access-jwt",
      "refresh-jwt",
      tokens.accessTokenExpiresAt,
      tokens.refreshTokenExpiresAt,
    );
    expect(body.data.accessToken).toBeUndefined();
    expect(body.data.refreshToken).toBeUndefined();
    expect(body.data.accessTokenExpiresAt).toBe(tokens.accessTokenExpiresAt);
    expect(body.data.user).toEqual({ id: "u1", email: "a@b.c" });
    expect(JSON.stringify(body)).not.toContain("access-jwt");
    expect(JSON.stringify(body)).not.toContain("refresh-jwt");
  });

  it("Given: a successful refresh When: the BFF responds Then: tokens go to cookies and the body has neither token", async () => {
    mockGetRefreshToken.mockResolvedValue("old-refresh");
    fetchMock.mockResolvedValue(backendOk({ ...tokens, user: { id: "u1" } }));
    const request = new NextRequest(
      "https://app.example.com/api/auth/refresh",
      { method: "POST" },
    );

    const response = await refresh(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockSetAuthCookies).toHaveBeenCalledWith(
      "access-jwt",
      "refresh-jwt",
      tokens.accessTokenExpiresAt,
      tokens.refreshTokenExpiresAt,
    );
    expect(body.data.accessToken).toBeUndefined();
    expect(body.data.refreshToken).toBeUndefined();
    expect(body.data.accessTokenExpiresAt).toBe(tokens.accessTokenExpiresAt);
    expect(body.data.user).toEqual({ id: "u1" });
    expect(JSON.stringify(body)).not.toContain("access-jwt");
  });
});
