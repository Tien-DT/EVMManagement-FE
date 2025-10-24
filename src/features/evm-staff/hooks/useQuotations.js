// src/features/evm-staff/hooks/useQuotations.js
import { useState, useEffect, useCallback } from "react";
import { quotationService } from "../services/quotationService";

const useQuotations = (dealerId = null) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all quotations or by dealer
  const fetchQuotations = useCallback(async (pageNumber = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = dealerId 
        ? await quotationService.getQuotationsByDealerId(dealerId, pageNumber, pageSize)
        : await quotationService.getAllQuotations(pageNumber, pageSize);
      
      console.log("📊 Full API response:", response);
      console.log("📊 Response.data:", response?.data);
      
      const data = response?.data?.items || [];
      console.log("📊 Parsed quotations data:", data);
      console.log("📊 Total quotations:", data.length);
      
      setQuotations(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch quotations";
      setError(errorMessage);
      console.error("❌ Error fetching quotations:", err);
      
      // Set empty array on error để tránh crash UI
      setQuotations([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  // Get quotation by ID
  const getQuotationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationService.getQuotationById(id);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch quotation");
      console.error("Error fetching quotation:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create quotation
  const createQuotation = useCallback(async (quotationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationService.createQuotation(quotationData);
      await fetchQuotations(); // Refresh list
      return data;
    } catch (err) {
      setError(err.message || "Failed to create quotation");
      console.error("Error creating quotation:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotations]);

  // Update quotation
  const updateQuotation = useCallback(async (id, quotationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationService.updateQuotation(id, quotationData);
      await fetchQuotations(); // Refresh list
      return data;
    } catch (err) {
      setError(err.message || "Failed to update quotation");
      console.error("Error updating quotation:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotations]);

  // Delete quotation
  const deleteQuotation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await quotationService.deleteQuotation(id);
      await fetchQuotations(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message || "Failed to delete quotation");
      console.error("Error deleting quotation:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotations]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return {
    quotations,
    loading,
    error,
    fetchQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
  };
};

export default useQuotations;

