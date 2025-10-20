import { useState, useEffect } from "react";
import { dealerService } from "../services/dealerService";

export const useWarehouses = (dealerId) => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const fetchWarehouses = async (pageNumber = 1, pageSize = 10) => {
    if (!dealerId) {
      console.log("No dealerId provided, skipping fetch");
      setError("Dealer ID is required");
      setIsLoading(false);
      return;
    }

    console.log("Fetching warehouses for dealerId:", dealerId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await dealerService.getWarehousesByDealer(
        dealerId,
        pageNumber,
        pageSize
      );

      console.log("Warehouses API response:", response);

      if (response.success && response.data) {
        // Kiểm tra xem response.data có phải là array không
        const warehousesData = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.warehouses || [];

        setWarehouses(warehousesData);
        console.log(
          "Full response structure:",
          JSON.stringify(response, null, 2)
        );
        console.log("Type of response.data:", typeof response.data);
        console.log("Is array?", Array.isArray(response.data));
        // Update pagination if provided in response
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
        setWarehouses([]);
      }
    } catch (err) {
      console.error("Fetch warehouses error:", err);
      setError(err.message || "Không thể tải danh sách kho hàng");
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dealerId) {
      fetchWarehouses();
    }
  }, [dealerId]);

  const deleteWarehouse = async (id) => {
    try {
      const response = await dealerService.deleteWarehouse(id);

      if (response.success) {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        return { success: true };
      } else {
        throw new Error(response.message || "Xóa kho hàng thất bại");
      }
    } catch (err) {
      console.error("Delete warehouse error:", err);
      return { success: false, error: err.message };
    }
  };

  const changePage = (pageNumber) => {
    fetchWarehouses(pageNumber, pagination.pageSize);
  };

  return {
    warehouses,
    isLoading,
    error,
    pagination,
    refreshWarehouses: fetchWarehouses,
    deleteWarehouse,
    changePage,
  };
};
