import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  isValidDate,
  getDateMonthsAgo,
  formatYearMonth,
  filterRecentTransactions,
} from "./dateUtils.js";

describe("dateUtils", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-09-15T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("isValidDate", () => {
    it("returns true for valid Date objects", () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date("2025-01-01"))).toBe(true);
      expect(isValidDate(new Date(2025, 0, 1))).toBe(true);
    });

    it("returns false for invalid Date objects", () => {
      expect(isValidDate(new Date("invalid"))).toBe(false);
      expect(isValidDate(new Date("not-a-date"))).toBe(false);
      expect(isValidDate(new Date(NaN))).toBe(false);
    });

    it("returns false for non-Date values", () => {
      expect(isValidDate("2025-01-01")).toBe(false);
      expect(isValidDate(1234567890)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate({})).toBe(false);
      expect(isValidDate([])).toBe(false);
    });
  });

  describe("getDateMonthsAgo", () => {
    it("returns current date for 0 months", () => {
      const result = getDateMonthsAgo(0);
      expect(result.toISOString()).toBe("2025-09-15T00:00:00.000Z");
    });

    it("calculates dates correctly for various months", () => {
      expect(getDateMonthsAgo(1).toISOString()).toBe("2025-08-15T00:00:00.000Z");
      expect(getDateMonthsAgo(3).toISOString()).toBe("2025-06-15T00:00:00.000Z");
      expect(getDateMonthsAgo(6).toISOString()).toBe("2025-03-15T00:00:00.000Z");
      expect(getDateMonthsAgo(12).toISOString()).toBe("2024-09-15T00:00:00.000Z");
    });

    it("handles year boundaries correctly", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      expect(getDateMonthsAgo(1).toISOString()).toBe("2024-12-15T00:00:00.000Z");
      expect(getDateMonthsAgo(3).toISOString()).toBe("2024-10-15T00:00:00.000Z");
      vi.setSystemTime(new Date("2025-09-15T12:00:00Z"));
    });

    it("returns UTC midnight dates", () => {
      const result = getDateMonthsAgo(1);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });
  });

  describe("formatYearMonth", () => {
    it("formats dates correctly in YYYY-MM format", () => {
      expect(formatYearMonth(new Date("2025-01-15"))).toBe("2025-01");
      expect(formatYearMonth(new Date("2025-09-15"))).toBe("2025-09");
      expect(formatYearMonth(new Date("2025-12-31"))).toBe("2025-12");
    });

    it("handles single-digit months with leading zero", () => {
      expect(formatYearMonth(new Date("2025-01-01"))).toBe("2025-01");
      expect(formatYearMonth(new Date("2025-05-15"))).toBe("2025-05");
      expect(formatYearMonth(new Date("2025-09-01"))).toBe("2025-09");
    });

    it("handles year boundaries", () => {
      expect(formatYearMonth(new Date("2024-12-31"))).toBe("2024-12");
      expect(formatYearMonth(new Date("2026-01-01"))).toBe("2026-01");
    });

    it("uses UTC timezone", () => {
      const date = new Date("2025-09-15T23:00:00Z");
      expect(formatYearMonth(date)).toBe("2025-09");
    });
  });

  describe("filterRecentTransactions", () => {
    it("filters transactions within the specified months", () => {
      const transactions = [
        { id: "t1", date: "2025-09-10T00:00:00Z" },
        { id: "t2", date: "2025-08-15T00:00:00Z" },
        { id: "t3", date: "2025-07-01T00:00:00Z" },
        { id: "t4", date: "2025-06-14T23:59:59Z" },
        { id: "t5", date: "2025-06-15T00:00:00Z" },
      ];

      const result = filterRecentTransactions(transactions, 3);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("t1");
      expect(ids).toContain("t2");
      expect(ids).toContain("t3");
      expect(ids).toContain("t5");
      expect(ids).not.toContain("t4");
    });

    it("adds yearMonth property to filtered transactions", () => {
      const transactions = [
        { id: "t1", date: "2025-09-10T00:00:00Z" },
        { id: "t2", date: "2025-08-15T00:00:00Z" },
      ];

      const result = filterRecentTransactions(transactions, 3);
      expect(result[0].yearMonth).toBe("2025-09");
      expect(result[1].yearMonth).toBe("2025-08");
    });

    it("filters out transactions older than specified months", () => {
      const transactions = [
        { id: "t1", date: "2025-06-14T23:59:59Z" },
        { id: "t2", date: "2025-06-15T00:00:00Z" },
        { id: "t3", date: "2025-05-01T00:00:00Z" },
      ];

      const result = filterRecentTransactions(transactions, 3);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("t2");
      expect(ids).not.toContain("t1");
      expect(ids).not.toContain("t3");
    });

    it("filters out transactions with invalid dates", () => {
      const transactions = [
        { id: "t1", date: "2025-09-10T00:00:00Z" },
        { id: "t2", date: "invalid-date" },
        { id: "t3", date: null },
        { id: "t4", date: undefined },
        { id: "t5", date: "2025-08-15T00:00:00Z" },
      ];

      const result = filterRecentTransactions(transactions, 3);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("t1");
      expect(ids).toContain("t5");
      expect(ids).not.toContain("t2");
      expect(ids).not.toContain("t3");
      expect(ids).not.toContain("t4");
    });

    it("preserves all transaction properties", () => {
      const transactions = [
        {
          id: "t1",
          userId: "u1",
          amount: 100,
          date: "2025-09-10T00:00:00Z",
          customProp: "test",
        },
      ];

      const result = filterRecentTransactions(transactions, 3);
      expect(result[0]).toMatchObject({
        id: "t1",
        userId: "u1",
        amount: 100,
        date: "2025-09-10T00:00:00Z",
        customProp: "test",
        yearMonth: "2025-09",
      });
    });

    it("handles empty array", () => {
      const result = filterRecentTransactions([], 3);
      expect(result).toEqual([]);
    });



    it("uses default 3 months when months parameter is not provided", () => {
      const transactions = [
        { id: "t1", date: "2025-09-10T00:00:00Z" },
        { id: "t2", date: "2025-06-14T23:59:59Z" },
        { id: "t3", date: "2025-06-15T00:00:00Z" },
      ];

      const result = filterRecentTransactions(transactions);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("t1");
      expect(ids).toContain("t3");
      expect(ids).not.toContain("t2");
    });
  });
});

