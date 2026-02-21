/**
 * Error thrown when the auth API returns an error response.
 * The `code` is used as i18n key: auth.errors.{code}
 */
export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthApiError";
    Object.setPrototypeOf(this, AuthApiError.prototype);
  }
}

export type AuthErrorCode =
  | "unauthorized"
  | "forbidden"
  | "serverError"
  | "generic";

/**
 * Maps API error response to a translation key.
 */
export function getAuthErrorCode(
  statusCode: number,
  error?: string,
): AuthErrorCode {
  if (statusCode === 401 || error?.toLowerCase() === "unauthorized") {
    return "unauthorized";
  }
  if (statusCode === 403 || error?.toLowerCase() === "forbidden") {
    return "forbidden";
  }
  if (statusCode >= 500) {
    return "serverError";
  }
  return "generic";
}
