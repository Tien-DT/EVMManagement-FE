import { useState, useEffect } from "react";
import { dealerService } from "../services/dealerService";

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dealerService.getAllWarehouses();

      if (response.success && response.data) {
        setWarehouses(response.data);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.error("❌ Fetch warehouses error:", err);
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
      const response = await dealerService.deleteWarehouse(id);

      if (response.success) {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        return { success: true };
      } else {
        throw new Error(response.message || "Xóa kho hàng thất bại");
      }
    } catch (err) {
      console.error("❌ Delete warehouse error:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    warehouses,
    isLoading,
    error,
    refreshWarehouses: fetchWarehouses,
    deleteWarehouse,
  };
};
