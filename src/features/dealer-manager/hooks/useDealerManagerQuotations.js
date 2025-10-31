// src/features/dealer-manager/hooks/useDealerManagerQuotations.js
import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

export const useDealerManagerQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get all quotations
        const response = await axiosInstance.get(endpoints.quotations.getAll);

        if (response.success || response.data) {
          const data = response.data?.items || response.data || [];
          setQuotations(Array.isArray(data) ? data : []);
        } else {
          setQuotations([]);
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setError(error);
        setQuotations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotations();
  }, []); // Fetch once on mount

  const getQuotationById = async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.quotations.getById(id));
      return response.data || response;
    } catch (error) {
      console.error('Error fetching quotation by ID:', error);
      throw error;
    }
  };

  return {
    quotations,
    isLoading,
    error,
    getQuotationById,
  };
};

export default useDealerManagerQuotations;
