import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/change-password",
];

function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix to check the actual route
  const pathWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";
  return publicRoutes.some((route) => pathWithoutLocale.startsWith(route));
}

function getTokenFromCookies(request: NextRequest): string | null {
  // Check for token in cookies (set by client-side localStorage sync)
  const tokenCookie = request.cookies.get("nevada_auth_token");
  return tokenCookie?.value || null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle i18n routing first
  const i18nResponse = handleI18nRouting(request);

  // Check if this is a public route
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access login, redirect to dashboard
    const token = getTokenFromCookies(request);
    if (token && pathname.includes("/login")) {
      const locale = pathname.match(/^\/(en|es)/)?.[1] || routing.defaultLocale;
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return i18nResponse;
  }

  // For protected routes, check authentication
  const token = getTokenFromCookies(request);

  if (!token) {
    // Redirect to login if not authenticated
    const locale = pathname.match(/^\/(en|es)/)?.[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force password change guard: redirect to /change-password if flag is set
  const mustChangePwd = request.cookies.get("nevada_must_change_pwd");
  if (mustChangePwd?.value === "1") {
    const pathWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";
    if (!pathWithoutLocale.startsWith("/change-password")) {
      const locale = pathname.match(/^\/(en|es)/)?.[1] || routing.defaultLocale;
      const changePasswordUrl = new URL(
        `/${locale}/change-password`,
        request.url,
      );
      return NextResponse.redirect(changePasswordUrl);
    }
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/", "/(en|es)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
