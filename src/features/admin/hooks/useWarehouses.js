import { useState, useEffect } from "react";
import warehouseService from "../services/warehouseService";

export const useWarehouses = (pageNumber = 1, pageSize = 10) => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const fetchWarehouses = async (page = pageNumber, size = pageSize) => {
    console.log("Fetching warehouses for admin");
    setIsLoading(true);
    setError(null);

    try {
      const response = await warehouseService.getAllWarehouses(page, size);

      console.log("Warehouses API response:", response);

      if (response.success && response.data) {
        // Handle both array and paginated response
        const warehousesData = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.warehouses || [];

        setWarehouses(warehousesData);
        
        // Update pagination if provided in response
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage || page,
            pageSize: response.pagination.pageSize || size,
            totalPages: response.pagination.totalPages || 0,
            totalCount: response.pagination.totalCount || 0,
          });
        } else if (response.data?.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage || page,
            pageSize: response.data.pagination.pageSize || size,
            totalPages: response.data.pagination.totalPages || 0,
            totalCount: response.data.pagination.totalCount || 0,
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
    fetchWarehouses();
  }, []);

  const deleteWarehouse = async (id) => {
    try {
      const response = await warehouseService.deleteWarehouse(id);

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

export const useWarehouse = (id) => {
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouse = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await warehouseService.getWarehouseById(id);

      if (response.success && response.data) {
        setWarehouse(response.data);
      } else {
        throw new Error(response.message || "Không tìm thấy kho hàng");
      }
    } catch (err) {
      console.error("Fetch warehouse error:", err);
      setError(err.message || "Không thể tải thông tin kho hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

  return {
    warehouse,
    isLoading,
    error,
    refreshWarehouse: fetchWarehouse,
  };
};

