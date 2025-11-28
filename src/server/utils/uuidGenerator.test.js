import { describe, it, expect } from "vitest";
import { ensureTransactionId, ensureCustomerId } from "./uuidGenerator.js";

describe("uuidGenerator", () => {
  describe("ensureTransactionId", () => {
    it("returns existing ID if transaction has valid string ID", () => {
      const transaction = { id: "t1", amount: 100 };
      expect(ensureTransactionId(transaction)).toBe("t1");
    });

    it("generates new UUID if transaction has no ID", () => {
      const transaction = { amount: 100 };
      const id = ensureTransactionId(transaction);
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates new UUID if transaction ID is empty string", () => {
      const transaction = { id: "", amount: 100 };
      const id = ensureTransactionId(transaction);
      expect(id).toBeTruthy();
      expect(id).not.toBe("");
    });

    it("generates new UUID if transaction ID is not a string", () => {
      const transaction1 = { id: 123, amount: 100 };
      const transaction2 = { id: null, amount: 100 };
      const transaction3 = { id: undefined, amount: 100 };

      const id1 = ensureTransactionId(transaction1);
      const id2 = ensureTransactionId(transaction2);
      const id3 = ensureTransactionId(transaction3);

      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(typeof id3).toBe("string");
    });

    it("generates unique UUIDs for different transactions", () => {
      const transaction1 = { amount: 100 };
      const transaction2 = { amount: 200 };

      const id1 = ensureTransactionId(transaction1);
      const id2 = ensureTransactionId(transaction2);

      expect(id1).not.toBe(id2);
    });

    it("preserves existing valid IDs across multiple calls", () => {
      const transaction = { id: "t1", amount: 100 };
      expect(ensureTransactionId(transaction)).toBe("t1");
      expect(ensureTransactionId(transaction)).toBe("t1");
    });
  });

  describe("ensureCustomerId", () => {
    it("returns existing ID if customer has valid string ID", () => {
      const customer = { id: "u1", name: "Test" };
      expect(ensureCustomerId(customer)).toBe("u1");
    });

    it("generates new UUID if customer has no ID", () => {
      const customer = { name: "Test" };
      const id = ensureCustomerId(customer);
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates new UUID if customer ID is empty string", () => {
      const customer = { id: "", name: "Test" };
      const id = ensureCustomerId(customer);
      expect(id).toBeTruthy();
      expect(id).not.toBe("");
    });

    it("generates new UUID if customer ID is not a string", () => {
      const customer1 = { id: 123, name: "Test" };
      const customer2 = { id: null, name: "Test" };
      const customer3 = { id: undefined, name: "Test" };

      const id1 = ensureCustomerId(customer1);
      const id2 = ensureCustomerId(customer2);
      const id3 = ensureCustomerId(customer3);

      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(typeof id3).toBe("string");
    });

    it("generates unique UUIDs for different customers", () => {
      const customer1 = { name: "Test1" };
      const customer2 = { name: "Test2" };

      const id1 = ensureCustomerId(customer1);
      const id2 = ensureCustomerId(customer2);

      expect(id1).not.toBe(id2);
    });

    it("preserves existing valid IDs across multiple calls", () => {
      const customer = { id: "u1", name: "Test" };
      expect(ensureCustomerId(customer)).toBe("u1");
      expect(ensureCustomerId(customer)).toBe("u1");
    });
  });
});

