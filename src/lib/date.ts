type DateInput = Date | string | null | undefined;

/**
 * Safely convert a value to a Date object.
 * Handles Date objects, ISO strings, and invalid values.
 */
function toSafeDate(date: DateInput): Date | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: DateInput, locale: string = "en"): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format a date to a short localized string
 */
export function formatDateShort(
  date: DateInput,
  locale: string = "en",
): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: DateInput, locale: string = "en"): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format a date with short date style and time
 */
export function formatDateTimeShort(
  date: DateInput,
  locale: string = "en",
): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/**
 * Format a date with medium date style and short time
 */
export function formatDateTimeMedium(
  date: DateInput,
  locale: string = "en",
): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/**
 * Format a date with full date style and medium time
 */
export function formatDateTimeFull(
  date: DateInput,
  locale: string = "en",
): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(d);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(
  date: DateInput,
  locale: string = "en",
): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const now = new Date();
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);

  const intervals: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }

  return rtf.format(0, "second");
}

/**
 * Check if a date is today
 */
export function isToday(date: DateInput): boolean {
  const d = toSafeDate(date);
  if (!d) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: DateInput): boolean {
  const d = toSafeDate(date);
  if (!d) return false;
  return d.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: DateInput): boolean {
  const d = toSafeDate(date);
  if (!d) return false;
  return d.getTime() > Date.now();
}
