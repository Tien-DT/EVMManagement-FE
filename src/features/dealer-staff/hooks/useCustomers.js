// src/features/dealer-staff/hooks/useCustomers.js
import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";

export const useCustomers = (dealerId) => {
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
    if (!dealerId) {
      console.log("No dealerId provided, skipping fetch");
      setError("Dealer ID is required");
      setIsLoading(false);
      return;
    }

    console.log("Fetching customers for dealerId:", dealerId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await customerService.getCustomersByDealer(
        dealerId,
        pageNumber,
        pageSize
      );

      console.log("Customers API response:", response);

      if (response.success && response.data) {
        console.log("Full response structure:", JSON.stringify(response, null, 2));
        console.log("Type of response.data:", typeof response.data);
        console.log("Is data array?", Array.isArray(response.data));
        
        // Xử lý response data - API trả về data.items
        const customersData = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.customers || [];

        console.log("Processed customersData:", customersData);
        console.log("Number of customers:", customersData.length);
        
        setCustomers(customersData);

        // Update pagination from response
        const paginationData = {
          currentPage: response.data.pageNumber || pageNumber,
          pageSize: response.data.pageSize || pageSize,
          totalPages: response.data.totalPages || 0,
          totalCount: response.data.totalCount || 0,
        };
        
        console.log("Pagination data:", paginationData);
        setPagination(paginationData);
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
    if (dealerId) {
      fetchCustomers();
    }
  }, [dealerId]);

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