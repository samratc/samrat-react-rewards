import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.API_BASE_URL;

/**
 * Custom hook for fetching and managing rewards data
 * @returns {Object} - { rewardsData, isLoading, error, refetch }
 */
export function useRewardsData() {
  const [rewardsData, setRewardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRewardsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/customer-points`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error in API response");
      }

      setRewardsData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

  return { rewardsData, isLoading, error, refetch: fetchRewardsData };
}

