import { useState, useEffect, useCallback } from "react";
import { vehicleService } from "../services/vehicleService";
import { message } from "antd";

export const useDealerVehicleModels = (dealerId) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchModels = useCallback(async (page = 1, pageSize = 100) => {
    if (!dealerId) {
      console.warn("No dealerId provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("🚗 Fetching vehicle models with stock for dealerId:", dealerId);
      let response;
      
      try {
        // Try with-stock endpoint first
        response = await vehicleService.getVehicleModelsWithStock(
          dealerId,
          page,
          pageSize
        );
        console.log("📦 API Response (with-stock):", response);
      } catch (error) {
        console.warn("⚠️ with-stock endpoint failed, trying getByDealer:", error);
        // Fallback to getByDealer endpoint
        response = await vehicleService.getVehicleModelsByDealer(
          dealerId,
          page,
          pageSize
        );
        console.log("📦 API Response (getByDealer):", response);
      }

      let modelsData = [];
      let total = 0;

      // axiosInstance already returns response.data, so we need to handle different structures
      // API might return: { success: true, data: {...} } or { items: [...], totalCount: ... } or just array
      
      if (response?.success && response?.data) {
        // Structure: { success: true, data: { items: [...], totalCount: ... } }
        const data = response.data;
        if (Array.isArray(data.items)) {
          modelsData = data.items;
          total = data.totalCount ?? data.total ?? modelsData.length;
        } else if (Array.isArray(data)) {
          modelsData = data;
          total = modelsData.length;
        }
      } else if (Array.isArray(response?.items)) {
        // Structure: { items: [...], totalCount: ... }
        modelsData = response.items;
        total = response.totalCount ?? response.total ?? modelsData.length;
      } else if (Array.isArray(response)) {
        // Structure: [...]
        modelsData = response;
        total = modelsData.length;
      } else if (response?.data) {
        // Structure: { data: { items: [...], totalCount: ... } }
        const data = response.data;
        if (Array.isArray(data.items)) {
          modelsData = data.items;
          total = data.totalCount ?? data.total ?? modelsData.length;
        } else if (Array.isArray(data)) {
          modelsData = data;
          total = modelsData.length;
        }
      }

      console.log("✅ Parsed models data:", modelsData);
      console.log("📊 Total models:", total);

      // Sort by available stock (models with stock first)
      if (modelsData.length > 0) {
        modelsData = modelsData.sort((a, b) => {
          const stockA = a.availableStock ?? a.stock ?? 0;
          const stockB = b.availableStock ?? b.stock ?? 0;
          if (stockA > 0 && stockB === 0) return -1;
          if (stockA === 0 && stockB > 0) return 1;
          return 0;
        });
      }

      setModels(modelsData);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("❌ Error fetching vehicle models:", error);
      console.error("Error details:", error.response?.data || error.message);
      message.error("Không thể tải danh sách xe: " + (error.message || "Đã có lỗi xảy ra"));
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    if (dealerId) {
      fetchModels();
    }
  }, [dealerId, fetchModels]);

  const handleTableChange = (newPagination) => {
    fetchModels(newPagination.current, newPagination.pageSize);
  };

  return {
    models,
    loading,
    pagination,
    fetchModels,
    handleTableChange,
  };
};

export default useDealerVehicleModels;
