import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  errorCode?: string;
}

/**
 * Extracts a localized error message from an API error response.
 *
 * Resolution order:
 * 1. Translated message for `errorCode` from `apiErrors.{CODE}` namespace
 * 2. Raw `message` from the API response
 * 3. Generic fallback
 */
export function getApiErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  const data = extractErrorData(error);

  if (data?.errorCode) {
    const translated = t(data.errorCode);
    // next-intl returns the key itself when translation is missing
    if (translated !== data.errorCode) {
      return translated;
    }
  }

  if (data?.message) {
    return data.message;
  }

  return t("UNKNOWN_ERROR");
}

function extractErrorData(error: unknown): ApiErrorResponse | null {
  if (error instanceof AxiosError) {
    return error.response?.data ?? null;
  }

  if (error && typeof error === "object" && "response" in error) {
    const resp = (error as { response?: { data?: ApiErrorResponse } }).response;
    return resp?.data ?? null;
  }

  return null;
}
