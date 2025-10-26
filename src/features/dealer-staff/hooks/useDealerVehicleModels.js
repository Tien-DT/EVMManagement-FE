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
      return;
    }

    setLoading(true);
    try {
      const response = await vehicleService.getVehicleModelsWithStock(
        dealerId,
        page,
        pageSize
      );

      let modelsData = [];
      let total = 0;

      if (response?.data) {
        if (Array.isArray(response.data.items)) {
          modelsData = response.data.items;
          total = response.data.totalCount || modelsData.length;
        } else if (Array.isArray(response.data)) {
          modelsData = response.data;
          total = modelsData.length;
        }
      } else if (Array.isArray(response)) {
        modelsData = response;
        total = modelsData.length;
      }

      modelsData = modelsData.sort((a, b) => {
        if (a.availableStock > 0 && b.availableStock === 0) return -1;
        if (a.availableStock === 0 && b.availableStock > 0) return 1;
        return 0;
      });

      setModels(modelsData);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      message.error("Không thể tải danh sách xe");
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
