// src/features/dealer-staff/hooks/useQuotations.js
import { useState, useEffect } from "react";
import { quotationService } from "../services/quotationService";

export const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const fetchQuotations = async (pageNumber = 1, pageSize = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await quotationService.getAllQuotations(
        pageNumber,
        pageSize
      );

      console.log("Quotations API response:", response);

      if (response.success && response.data) {
        // Xử lý response data
        const quotationsData = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.quotations || [];

        setQuotations(quotationsData);

        // Update pagination
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage || pageNumber,
            pageSize: response.pagination.pageSize || pageSize,
            totalPages: response.pagination.totalPages || 0,
            totalCount: response.pagination.totalCount || 0,
          });
        }
      } else {
        console.log("No data in response or success=false");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Fetch quotations error:", err);
      setError(err.message || "Không thể tải danh sách báo giá");
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const deleteQuotation = async (id) => {
    try {
      const response = await quotationService.deleteQuotation(id);

      if (response.success) {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
        return { success: true };
      } else {
        throw new Error(response.message || "Xóa báo giá thất bại");
      }
    } catch (err) {
      console.error("Delete quotation error:", err);
      return { success: false, error: err.message };
    }
  };

  const changePage = (pageNumber) => {
    fetchQuotations(pageNumber, pagination.pageSize);
  };

  return {
    quotations,
    isLoading,
    error,
    pagination,
    refreshQuotations: fetchQuotations,
    deleteQuotation,
    changePage,
  };
};
