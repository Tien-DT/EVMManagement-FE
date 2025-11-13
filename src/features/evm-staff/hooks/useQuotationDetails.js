// src/features/evm-staff/hooks/useQuotationDetails.js
import { useState, useCallback } from "react";
import quotationDetailService from "../services/quotationDetailService";

const useQuotationDetails = () => {
  const [quotationDetails, setQuotationDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all quotation details
  const fetchQuotationDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationDetailService.getAllQuotationDetails();
      // axiosInstance already returns response.data, so response is the data object
      // It could be { items: [...] } or just an array
      const data = response?.items || (Array.isArray(response) ? response : []);
      setQuotationDetails(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch quotation details";
      setError(errorMessage);
      console.error("Error fetching quotation details:", err);
      setQuotationDetails([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch quotation details by quotation ID
  const fetchQuotationDetailsByQuotationId = useCallback(async (quotationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationDetailService.getQuotationDetailsByQuotationId(quotationId);
      console.log("🔍 [useQuotationDetails] Raw response:", response);
      // axiosInstance already returns response.data, so response is the data object
      // It could be { items: [...] } or just an array
      const data = response?.items || (Array.isArray(response) ? response : []);
      console.log("🔍 [useQuotationDetails] Processed data:", data);
      setQuotationDetails(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch quotation details";
      setError(errorMessage);
      console.error("Error fetching quotation details:", err);
      setQuotationDetails([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quotation detail by ID
  const getQuotationDetailById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationDetailService.getQuotationDetailById(id);
      return response?.data;
    } catch (err) {
      setError(err.message || "Failed to fetch quotation detail");
      console.error("Error fetching quotation detail:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create quotation detail
  const createQuotationDetail = useCallback(async (detailData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationDetailService.createQuotationDetail(detailData);
      return response?.data;
    } catch (err) {
      setError(err.message || "Failed to create quotation detail");
      console.error("Error creating quotation detail:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create multiple quotation details
  const createQuotationDetails = useCallback(async (detailsArray) => {
    setLoading(true);
    setError(null);
    try {
      const promises = detailsArray.map(detail => 
        quotationDetailService.createQuotationDetail(detail)
      );
      const results = await Promise.all(promises);
      return results.map(r => r?.data);
    } catch (err) {
      setError(err.message || "Failed to create quotation details");
      console.error("Error creating quotation details:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update quotation detail
  const updateQuotationDetail = useCallback(async (id, detailData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationDetailService.updateQuotationDetail(id, detailData);
      return response?.data;
    } catch (err) {
      setError(err.message || "Failed to update quotation detail");
      console.error("Error updating quotation detail:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete quotation detail
  const deleteQuotationDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await quotationDetailService.deleteQuotationDetail(id);
      return true;
    } catch (err) {
      setError(err.message || "Failed to delete quotation detail");
      console.error("Error deleting quotation detail:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quotationDetails,
    loading,
    error,
    fetchQuotationDetails,
    fetchQuotationDetailsByQuotationId,
    getQuotationDetailById,
    createQuotationDetail,
    createQuotationDetails,
    updateQuotationDetail,
    deleteQuotationDetail,
  };
};

export default useQuotationDetails;

