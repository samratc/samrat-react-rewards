import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRewardsData } from "./useRewardsData.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("useRewardsData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3001/api";
  });

  it("initializes with empty data and loading state", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useRewardsData());

    expect(result.current.rewardsData).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  

  it("handles HTTP error responses", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useRewardsData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("HTTP error! status: 500");
    expect(result.current.rewardsData).toEqual([]);
  });

  it("handles API response with success: false", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: "Server error",
      }),
    });

    const { result } = renderHook(() => useRewardsData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Server error");
    expect(result.current.rewardsData).toEqual([]);
  });

  it("handles network errors", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useRewardsData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.rewardsData).toEqual([]);
  });

  it("provides refetch function", async () => {
    const mockData = [{ customerId: "u1", name: "Aarav", totalPoints: 100 }];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useRewardsData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe("function");

    // Test refetch
    await act(async () => {
      await result.current.refetch();
    });
  });

  it("resets error state on successful refetch", async () => {
    // First call fails
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useRewardsData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");

    // Second call succeeds
    const mockData = [{ customerId: "u1", name: "Aarav", totalPoints: 100 }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });

    expect(result.current.rewardsData).toEqual(mockData);
  });
});

