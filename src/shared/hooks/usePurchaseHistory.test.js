import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePurchaseHistory } from "./usePurchaseHistory.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("usePurchaseHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3001/api";
  });

  it("initializes with empty data and not loading", () => {
    const { result } = renderHook(() => usePurchaseHistory());

    expect(result.current.purchaseHistory).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.fetchHistory).toBeDefined();
  });

  

  it("sets loading state during fetch", async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    global.fetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => usePurchaseHistory());

    let fetchPromise2;
    await act(async () => {
      fetchPromise2 = result.current.fetchHistory("u1");
    });

    // Wait for the loading state to be set to true
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolveFetch({
      ok: true,
      json: async () => ({ success: true, data: { transactions: [] } }),
    });

    await fetchPromise2;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles HTTP error responses", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => usePurchaseHistory());

    await act(async () => {
      await expect(result.current.fetchHistory("u1")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("HTTP error! status: 404");
  });

  it("handles API response with success: false", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: "Customer not found",
      }),
    });

    const { result } = renderHook(() => usePurchaseHistory());

    await act(async () => {
      await expect(result.current.fetchHistory("u1")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Customer not found");
  });

  it("handles network errors", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => usePurchaseHistory());

    await act(async () => {
      await expect(result.current.fetchHistory("u1")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("handles missing transactions array in response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { customerId: "u1", customerName: "Aarav" },
      }),
    });

    const { result } = renderHook(() => usePurchaseHistory());

    await act(async () => {
      await result.current.fetchHistory("u1");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.purchaseHistory).toEqual([]);
  });

  it("returns data from fetchHistory", async () => {
    const mockData = {
      customerId: "u1",
      customerName: "Aarav",
      transactions: [{ transactionId: "t1", amount: 100, points: 50 }],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => usePurchaseHistory());

    let returnedData;
    await act(async () => {
      returnedData = await result.current.fetchHistory("u1");
    });

    expect(returnedData).toEqual(mockData);
  });

  it("resets error state on successful fetch", async () => {
    const { result } = renderHook(() => usePurchaseHistory());

    // First call fails
    global.fetch.mockRejectedValueOnce(new Error("Network error"));
    await act(async () => {
      await expect(result.current.fetchHistory("u1")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

    // Second call succeeds
    const mockData = {
      customerId: "u1",
      customerName: "Aarav",
      transactions: [],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    await act(async () => {
      await result.current.fetchHistory("u1");
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });
});

