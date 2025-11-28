import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-09-05T00:00:00Z"));
});

describe("Server utilities and routes", () => {
  const baseMockData = {
    customers: [
      { id: "u1", name: "Aarav" },
      { id: "u2", name: "Rian" }
    ],
    transactions: [
      { id: "t1", userId: "u1", amount: 120.00, date: "2025-06-10T11:00:00Z" },
      { id: "t2", userId: "u1", amount: 45.00,  date: "2025-07-01T00:00:00Z" },
      { id: "t3", userId: "u2", amount: 51.00,  date: "2025-08-02T10:10:00Z" },
      { id: "old", userId: "u1", amount: 200.00, date: "2025-05-30T10:00:00Z" }
    ]
  };

  let statMock;

  const mockFsWithData = (data = baseMockData, mtimes = [111]) => {
    statMock = vi.fn();
    mtimes.forEach(ms => statMock.mockResolvedValueOnce({ mtimeMs: ms }));
    statMock.mockResolvedValue({ mtimeMs: mtimes[mtimes.length - 1] });

    vi.doMock("./server/utils/dataLoader.js", () => ({
      getTransactionData: vi.fn().mockResolvedValue(data)
    }));
  };

  beforeEach(() => {
    vi.resetModules();
  });

  describe("Utility functions", () => {
    it("calculatePoints: thresholds", async () => {
      const { calculatePoints } = await import("./server/utils/pointsCalculator.js");

      expect(calculatePoints(0)).toBe(0);
      expect(calculatePoints(49.99)).toBe(0);
      expect(calculatePoints(50)).toBe(0);
      expect(calculatePoints(51)).toBe(1);
      expect(calculatePoints(99.99)).toBe(49);
      expect(calculatePoints(100)).toBe(50);
      expect(calculatePoints(120)).toBe(90);
      expect(calculatePoints(140.99)).toBe(130);
    });

    it("getDateMonthsAgo: now - n months @ UTC midnight", async () => {
      const { getDateMonthsAgo } = await import("./server/utils/dateUtils.js");

      expect(getDateMonthsAgo(0).toISOString()).toBe("2025-09-05T00:00:00.000Z");
      expect(getDateMonthsAgo(3).toISOString()).toBe("2025-06-05T00:00:00.000Z");
    });

    it("isValidDate", async () => {
      const { isValidDate } = await import("./server/utils/dateUtils.js");
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date("not-a-date"))).toBe(false);
      expect(isValidDate("2020-01-01")).toBe(false);
    });

    it("filterRecentTransactions: filters & adds yearMonth", async () => {
      const { filterRecentTransactions } = await import("./server/utils/dateUtils.js");

      const transactions = [
        { id: "in1", date: "2025-06-05T00:00:00Z" },
        { id: "in2", date: "2025-08-31T12:00:00Z" },
        { id: "out", date: "2025-06-04T23:59:59Z" },
        { id: "bad", date: "banana" },
      ];
      const result = filterRecentTransactions(transactions, 3);
      const ids = result.map(transaction => transaction.id);
      expect(ids).toEqual(expect.arrayContaining(["in1", "in2"]));
      expect(ids).not.toContain("out");
      expect(ids).not.toContain("bad");
      expect(result.find(transaction => transaction.id === "in2").yearMonth).toBe("2025-08");
    });
  });

  describe("API Routes", () => {
    it("GET /", async () => {
      mockFsWithData();
      const { app } = await import("./server.js");
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello World!");
    });

    it("GET /api/customer-points", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-points");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const customer1 = response.body.data.find(customer => customer.customerId === "u1");
      const customer2 = response.body.data.find(customer => customer.customerId === "u2");
      expect(customer1.totalPoints).toBe(90);
      expect(customer1.totalAmountSpent).toBeCloseTo(165.0, 6);
      expect(customer1.monthlyPoints["2025-06"].points).toBe(90);
      expect(customer1.monthlyPoints["2025-07"].points).toBe(0);
      expect(customer2.totalPoints).toBe(1);
    });

    it("GET /api/customer-transactions/:id", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-transactions/u1");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      const transactionIds = data.transactions.map(transaction => transaction.transactionId);
      expect(transactionIds).toEqual(expect.arrayContaining(["t1", "t2"]));
      expect(transactionIds).not.toContain("old");
      expect(data.transactions.find(transaction => transaction.transactionId === "t1").points).toBe(90);
      expect(data.transactions.find(transaction => transaction.transactionId === "t2").points).toBe(0);
    });

    it("GET /api/customer-transactions/:id 404 when customer missing", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-transactions/nope");
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("500 when JSON load fails (/api/transactions)", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockRejectedValue(new Error("boom"))
      }));

      const { app } = await import("./server.js");
      const response = await request(app).get("/api/transactions");
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    it("GET /api/customer-points returns empty array when no customers", async () => {
      const emptyData = { customers: [], transactions: [] };
      mockFsWithData(emptyData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(emptyData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-points");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it("GET /api/customer-points handles customers with no transactions", async () => {
      const dataWithNoTransactions = {
        customers: [{ id: "u1", name: "Aarav" }],
        transactions: []
      };
      mockFsWithData(dataWithNoTransactions);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(dataWithNoTransactions)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-points");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const customer = response.body.data.find(c => c.customerId === "u1");
      expect(customer.totalPoints).toBe(0);
      expect(customer.totalAmountSpent).toBe(0);
    });

    it("GET /api/transactions returns all transactions", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/transactions");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta.count).toBe(4);
    });

    it("GET /api/customer-transactions/:id returns empty array when customer has no transactions", async () => {
      const dataWithNoCustomerTransactions = {
        customers: [{ id: "u1", name: "Aarav" }],
        transactions: [{ id: "t1", userId: "u2", amount: 100, date: "2025-09-01T00:00:00Z" }]
      };
      mockFsWithData(dataWithNoCustomerTransactions);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(dataWithNoCustomerTransactions)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-transactions/u1");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toEqual([]);
    });

    it("500 when JSON load fails (/api/customer-points)", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockRejectedValue(new Error("load error"))
      }));

      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-points");
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    it("500 when JSON load fails (/api/customer-transactions/:id)", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockRejectedValue(new Error("load error"))
      }));

      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-transactions/u1");
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    it("GET /api/customer-points includes customer name in response", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-points");
      expect(response.status).toBe(200);
      const customer1 = response.body.data.find(c => c.customerId === "u1");
      expect(customer1.name).toBe("Aarav");
    });

    it("GET /api/customer-transactions/:id includes customer name in response", async () => {
      mockFsWithData(baseMockData);
      vi.doMock("./server/utils/dataLoader.js", () => ({
        getTransactionData: vi.fn().mockResolvedValue(baseMockData)
      }));
      
      const { app } = await import("./server.js");
      const response = await request(app).get("/api/customer-transactions/u1");
      expect(response.status).toBe(200);
      expect(response.body.data.customerName).toBe("Aarav");
    });
  });
});
