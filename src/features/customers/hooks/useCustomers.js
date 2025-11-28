import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.API_BASE_URL;

/**
 * Custom hook for fetching and managing customer points data
 * @returns {Object} - { customers, isLoading, error }
 */
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/customer-points`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const payload = await response.json();
        
        if (!payload.success) {
          throw new Error(payload.message || "Error in API response");
        }
        
        setCustomers(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  return { customers, isLoading, error };
}

