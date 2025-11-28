import { useState } from "react";

const API_BASE_URL = import.meta.env.API_BASE_URL;

/**
 * Custom hook for fetching customer transaction details
 * @returns {Object} - { transactions, isLoading, error, fetchTransactions }
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = async (customerId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/customer-transactions/${customerId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const payload = await response.json();
      
      if (!payload.success) {
        throw new Error(payload.message || "Error in API response");
      }
      
      setTransactions(payload.data.transactions || []);
      return payload.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { transactions, isLoading, error, fetchTransactions };
}

