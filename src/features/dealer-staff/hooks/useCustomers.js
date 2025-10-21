// src/features/dealer-staff/hooks/useCustomers.js
import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const fetchCustomers = async (pageNumber = 1, pageSize = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await customerService.getAllCustomers(
        pageNumber,
        pageSize
      );

      console.log("Customers API response:", response);

      if (response.success && response.data) {
        // Xử lý response data
        const customersData = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.customers || [];

        setCustomers(customersData);

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
        setCustomers([]);
      }
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError(err.message || "Không thể tải danh sách khách hàng");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const deleteCustomer = async (id) => {
    try {
      const response = await customerService.deleteCustomer(id);

      if (response.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      } else {
        throw new Error(response.message || "Xóa khách hàng thất bại");
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      return { success: false, error: err.message };
    }
  };

  const changePage = (pageNumber) => {
    fetchCustomers(pageNumber, pagination.pageSize);
  };

  return {
    customers,
    isLoading,
    error,
    pagination,
    refreshCustomers: fetchCustomers,
    deleteCustomer,
    changePage,
  };
};
