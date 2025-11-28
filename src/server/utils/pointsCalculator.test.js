import { describe, it, expect } from "vitest";
import { calculatePoints } from "./pointsCalculator.js";

describe("pointsCalculator", () => {
  describe("calculatePoints", () => {
    it("returns 0 for amounts under $50", () => {
      expect(calculatePoints(0)).toBe(0);
      expect(calculatePoints(1)).toBe(0);
      expect(calculatePoints(49.99)).toBe(0);
      expect(calculatePoints(50)).toBe(0);
    });

    it("returns 0 for exactly $50", () => {
      expect(calculatePoints(50)).toBe(0);
    });

    it("calculates 1 point per dollar between $50 and $100", () => {
      expect(calculatePoints(51)).toBe(1);
      expect(calculatePoints(75)).toBe(25);
      expect(calculatePoints(99.99)).toBe(49);
      expect(calculatePoints(100)).toBe(50);
    });

    it("calculates correctly for amounts over $100", () => {
      expect(calculatePoints(101)).toBe(52); // 1*2 + 50
      expect(calculatePoints(120)).toBe(90); // 20*2 + 50
      expect(calculatePoints(150)).toBe(150); // 50*2 + 50
      expect(calculatePoints(200)).toBe(250); // 100*2 + 50
    });

    it("handles negative amounts (edge case)", () => {
      expect(calculatePoints(-10)).toBe(0);
      expect(calculatePoints(-100)).toBe(0);
    });

    it("handles very small positive amounts", () => {
      expect(calculatePoints(0.01)).toBe(0);
      expect(calculatePoints(0.99)).toBe(0);
    });
  });
});

