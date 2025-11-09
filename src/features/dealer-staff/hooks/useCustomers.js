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
    console.log("Fetching managed customers");
    setIsLoading(true);
    setError(null);

    try {
      // Use the new managed-by API endpoint
      const response = await customerService.getManagedCustomers(
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
    // Fetch customers on mount - no longer need dealerId
    fetchCustomers();
  }, []);

  const deleteCustomer = async (id) => {
    try {
      const response = await customerService.deleteCustomer(id);
      console.log("Delete customer response:", response);

      // Handle different response formats
      // DELETE API might return: {success: true} or just 200 OK with no body
      // axiosInstance returns response.data which could be empty for DELETE
      if (response?.success !== false) {
        // Success - remove from list and refresh
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        // Refresh customers list to update pagination
        await fetchCustomers(pagination.currentPage, pagination.pageSize);
        return { success: true };
      } else {
        const errorMsg = response?.message || "Xóa khách hàng thất bại";
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      const errorMessage = err.message || "Không thể xóa khách hàng";
      return { success: false, error: errorMessage };
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