import { describe, it, expect, beforeEach, vi } from "vitest";
import * as customerService from "./customerService.js";
import * as dataLoader from "../utils/dataLoader.js";
import * as dateUtils from "../utils/dateUtils.js";

vi.mock("../utils/dataLoader.js");
vi.mock("../utils/dateUtils.js");
vi.mock("../utils/pointsCalculator.js", () => ({
  calculatePoints: (amount) => {
    if (amount < 50) return 0;
    if (amount <= 100) return Math.floor(amount - 50);
    return Math.floor(amount - 100) * 2 + 50;
  },
}));
vi.mock("../utils/uuidGenerator.js", () => ({
  ensureCustomerId: (customer) => customer.id || "generated-id",
  ensureTransactionId: (transaction) => transaction.id || "generated-tx-id",
}));

describe("customerService", () => {
  const mockCustomers = [
    { id: "u1", name: "Aarav" },
    { id: "u2", name: "Rian" },
  ];

  const mockTransactions = [
    { id: "t1", userId: "u1", amount: 120, date: "2025-09-10T00:00:00Z" },
    { id: "t2", userId: "u1", amount: 45, date: "2025-08-15T00:00:00Z" },
    { id: "t3", userId: "u2", amount: 75, date: "2025-09-05T00:00:00Z" },
    { id: "t4", userId: "u1", amount: 150, date: "2025-07-01T00:00:00Z" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataLoader.getTransactionData).mockResolvedValue({
      customers: mockCustomers,
      transactions: mockTransactions,
    });
    vi.mocked(dateUtils.filterRecentTransactions).mockImplementation(
      (transactions) => transactions
    );
  });

  describe("getCustomerPoints", () => {
    it("returns customer points with correct structure", async () => {
      const result = await customerService.getCustomerPoints(3);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty("customerId");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("totalPoints");
      expect(result[0]).toHaveProperty("totalAmountSpent");
      expect(result[0]).toHaveProperty("monthlyPoints");
    });

    it("groups points by month correctly", async () => {
      vi.mocked(dateUtils.formatYearMonth).mockReturnValue("2025-09");
      const result = await customerService.getCustomerPoints(3);
      const customer1 = result.find((c) => c.customerId === "u1");

      expect(customer1.monthlyPoints).toHaveProperty("2025-09");
    });

    it("handles customers with no transactions", async () => {
      vi.mocked(dataLoader.getTransactionData).mockResolvedValue({
        customers: [{ id: "u3", name: "NoTransactions" }],
        transactions: [],
      });

      const result = await customerService.getCustomerPoints(3);
      const customer = result.find((c) => c.customerId === "u3");

      expect(customer.totalPoints).toBe(0);
      expect(customer.totalAmountSpent).toBe(0);
      expect(Object.keys(customer.monthlyPoints).length).toBe(0);
    });

    it("uses custom monthsBack parameter", async () => {
      await customerService.getCustomerPoints(6);
      expect(dateUtils.filterRecentTransactions).toHaveBeenCalledWith(
        mockTransactions,
        6
      );
    });

    it("handles errors from dataLoader", async () => {
      vi.mocked(dataLoader.getTransactionData).mockRejectedValue(
        new Error("Load failed")
      );

      await expect(customerService.getCustomerPoints(3)).rejects.toThrow(
        "Load failed"
      );
    });
  });

  describe("getCustomerTransactions", () => {
    it("returns customer transactions with correct structure", async () => {
      const result = await customerService.getCustomerTransactions("u1", 3);

      expect(result).toHaveProperty("customerId");
      expect(result).toHaveProperty("customerName");
      expect(result).toHaveProperty("transactions");
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it("filters transactions by customer ID", async () => {
      const result = await customerService.getCustomerTransactions("u1", 3);

      expect(result.transactions.length).toBe(3);
      expect(result.transactions.every((t) => t.transactionId)).toBe(true);
    });

    it("calculates points for each transaction", async () => {
      const result = await customerService.getCustomerTransactions("u1", 3);
      const tx1 = result.transactions.find((t) => t.transactionId === "t1");

      expect(tx1.points).toBe(90); // 120 -> 90 points
    });

    it("throws error when customer not found", async () => {
      await expect(
        customerService.getCustomerTransactions("nonexistent", 3)
      ).rejects.toThrow("Customer with ID nonexistent not found");
    });

    it("uses custom monthsBack parameter", async () => {
      await customerService.getCustomerTransactions("u1", 6);
      expect(dateUtils.filterRecentTransactions).toHaveBeenCalledWith(
        mockTransactions,
        6
      );
    });

    it("includes transaction details correctly", async () => {
      const result = await customerService.getCustomerTransactions("u1", 3);
      const transaction = result.transactions[0];

      expect(transaction).toHaveProperty("transactionId");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("date");
      expect(transaction).toHaveProperty("points");
    });
  });

  describe("getAllTransactions", () => {
    it("returns all transactions with customer data", async () => {
      const result = await customerService.getAllTransactions();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(4);
    });

    it("enriches transactions with customer information", async () => {
      const result = await customerService.getAllTransactions();
      const tx1 = result.find((t) => t.id === "t1");

      expect(tx1.customer).toEqual({ id: "u1", name: "Aarav" });
    });

    it("calculates points for all transactions", async () => {
      const result = await customerService.getAllTransactions();
      const tx1 = result.find((t) => t.id === "t1");

      expect(tx1.points).toBe(90);
    });

    it("handles transactions with missing customer", async () => {
      vi.mocked(dataLoader.getTransactionData).mockResolvedValue({
        customers: mockCustomers,
        transactions: [{ id: "t5", userId: "u99", amount: 100, date: "2025-09-01T00:00:00Z" }],
      });

      const result = await customerService.getAllTransactions();
      expect(result[0].customer).toBe(null);
    });

    it("preserves all transaction properties", async () => {
      const result = await customerService.getAllTransactions();
      const tx1 = result.find((t) => t.id === "t1");

      expect(tx1.userId).toBe("u1");
      expect(tx1.amount).toBe(120);
      expect(tx1.date).toBe("2025-09-10T00:00:00Z");
    });
  });
});

