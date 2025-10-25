// src/features/evm-staff/hooks/useQuotations.js
import { useState, useEffect } from "react";
import quotationService from "../services/quotationService";

const useQuotations = (dealerId = null) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Fetch all quotations or by dealer with pagination
  const fetchQuotations = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Fetching quotations with params:', params);
      const response = dealerId 
        ? await quotationService.getQuotationsByDealerId(dealerId, params)
        : await quotationService.getAllQuotations(params);
      
      console.log('Hook: Quotations response:', response);
      
      // axiosInstance already returns response.data, so response is { items: [...], totalCount, ... }
      const quotationsData = response.data || response;
      
      setQuotations(quotationsData.items || []);
      setPagination({
        pageNumber: quotationsData.pageNumber || 1,
        pageSize: quotationsData.pageSize || 10,
        totalCount: quotationsData.totalCount || 0,
        totalPages: quotationsData.totalPages || 0,
        hasNextPage: quotationsData.hasNextPage || false,
        hasPreviousPage: quotationsData.hasPreviousPage || false
      });
      return response;
    } catch (err) {
      console.error('Hook: Error fetching quotations:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách báo giá');
      setQuotations([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get quotation by ID
  const getQuotationById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.getQuotationById(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin báo giá');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create quotation
  const createQuotation = async (quotationData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating quotation with data:', quotationData);
      const response = await quotationService.createQuotation(quotationData);
      console.log('Hook: Quotation created successfully:', response);
      // Refresh quotations list
      await fetchQuotations();
      return response;
    } catch (err) {
      console.error('Hook: Error creating quotation:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo báo giá');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update quotation
  const updateQuotation = async (id, quotationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.updateQuotation(id, quotationData);
      // Refresh quotations list
      await fetchQuotations();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật báo giá');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete quotation
  const deleteQuotation = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.deleteQuotation(id);
      // Refresh quotations list
      await fetchQuotations();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa báo giá');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update quotation status
  const updateQuotationStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.updateQuotationStatus(id, status);
      // Refresh quotations list
      await fetchQuotations();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái báo giá');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get specific quotation by ID
  const getSpecificQuotation = async (quotationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.getSpecificQuotation(quotationId);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin báo giá cụ thể');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations().catch(err => {
      console.error('Initial fetch quotations failed:', err);
    });
  }, []);

  return {
    quotations,
    loading,
    error,
    pagination,
    fetchQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationStatus,
    getSpecificQuotation
  };
};

export default useQuotations;

