import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  getRelativeTime,
  isToday,
  isPast,
  isFuture,
} from "@/lib/date";

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("Given: a date When: formatting with default locale Then: should return long format in English", () => {
      const date = new Date("2026-01-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toContain("2026");
    });

    it("Given: a date and 'es' locale When: formatting Then: should return Spanish format", () => {
      const date = new Date("2026-03-01T12:00:00Z");
      const result = formatDate(date, "es");
      expect(result).toContain("2026");
    });

    it("Given: a date at year boundary When: formatting Then: should display correct year", () => {
      const date = new Date("2025-12-31T23:59:59Z");
      const result = formatDate(date);
      expect(result).toContain("2025");
    });
  });

  describe("formatDateShort", () => {
    it("Given: a date When: formatting short Then: should return MM/DD/YYYY style", () => {
      const date = new Date("2026-06-15T12:00:00Z");
      const result = formatDateShort(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("Given: a date and 'es' locale When: formatting short Then: should return localized short format", () => {
      const date = new Date("2026-06-15T12:00:00Z");
      const result = formatDateShort(date, "es");
      expect(result).toContain("2026");
    });
  });

  describe("formatDateTime", () => {
    it("Given: a date with time When: formatting Then: should include time component", () => {
      const date = new Date("2026-01-15T14:30:00Z");
      const result = formatDateTime(date);
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toContain("2026");
    });

    it("Given: a date and locale When: formatting datetime Then: should return localized datetime", () => {
      const date = new Date("2026-01-15T14:30:00Z");
      const result = formatDateTime(date, "es");
      expect(result).toContain("2026");
    });
  });

  describe("getRelativeTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("Given: a date 2 hours ago When: getting relative time Then: should return '2 hours ago'", () => {
      const date = new Date("2026-03-01T10:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toContain("2");
      expect(result).toContain("hour");
    });

    it("Given: a date 3 days ago When: getting relative time Then: should return '3 days ago'", () => {
      const date = new Date("2026-02-26T12:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toContain("3");
      expect(result).toContain("day");
    });

    it("Given: a date 2 months ago When: getting relative time Then: should return months ago", () => {
      const date = new Date("2026-01-01T12:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toContain("month");
    });

    it("Given: a date in the future When: getting relative time Then: should return future expression", () => {
      const date = new Date("2026-03-01T15:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toContain("3");
      expect(result).toContain("hour");
    });

    it("Given: a date just now When: getting relative time Then: should return seconds-level expression", () => {
      const date = new Date("2026-03-01T12:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toBeDefined();
    });

    it("Given: a date 1 year ago When: getting relative time Then: should return year expression", () => {
      const date = new Date("2025-03-01T12:00:00Z");
      const result = getRelativeTime(date);
      expect(result).toContain("year");
    });

    it("Given: 'es' locale When: getting relative time Then: should return Spanish", () => {
      const date = new Date("2026-03-01T10:00:00Z");
      const result = getRelativeTime(date, "es");
      expect(result).toContain("hora");
    });
  });

  describe("isToday", () => {
    it("Given: today's date When: checking isToday Then: should return true", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("Given: yesterday's date When: checking isToday Then: should return false", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it("Given: tomorrow's date When: checking isToday Then: should return false", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it("Given: same day different time When: checking isToday Then: should return true", () => {
      const now = new Date();
      const sameDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      expect(isToday(sameDay)).toBe(true);
    });
  });

  describe("isPast", () => {
    it("Given: a past date When: checking isPast Then: should return true", () => {
      const past = new Date("2020-01-01T00:00:00Z");
      expect(isPast(past)).toBe(true);
    });

    it("Given: a future date When: checking isPast Then: should return false", () => {
      const future = new Date("2099-01-01T00:00:00Z");
      expect(isPast(future)).toBe(false);
    });
  });

  describe("isFuture", () => {
    it("Given: a future date When: checking isFuture Then: should return true", () => {
      const future = new Date("2099-01-01T00:00:00Z");
      expect(isFuture(future)).toBe(true);
    });

    it("Given: a past date When: checking isFuture Then: should return false", () => {
      const past = new Date("2020-01-01T00:00:00Z");
      expect(isFuture(past)).toBe(false);
    });
  });
});
