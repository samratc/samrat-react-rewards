import { useState, useCallback } from "react";

const API_BASE_URL = import.meta.env.API_BASE_URL;

/**
 * Custom hook for fetching purchase history
 * @returns {Object} - { purchaseHistory, isLoading, error, fetchHistory }
 */
export function usePurchaseHistory() {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/customer-transactions/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error in API response");
      }

      setPurchaseHistory(result.data.transactions || []);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { purchaseHistory, isLoading, error, fetchHistory };
}

