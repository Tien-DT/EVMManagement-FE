import { useState, useEffect, useCallback } from "react";
import { vehicleService } from "../services/vehicleService";
import { message } from "antd";

export const useDealerVehicleVariants = (dealerId, modelId) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchVariants = useCallback(async (page = 1, pageSize = 100) => {
    if (!dealerId || !modelId) {
      console.warn("No dealerId or modelId provided");
      return;
    }

    setLoading(true);
    try {
      const response = await vehicleService.getVehicleVariantsWithStock(
        dealerId,
        modelId,
        page,
        pageSize
      );

      let variantsData = [];
      let total = 0;

      const payload = response?.data ?? response;

      if (Array.isArray(payload?.items)) {
        variantsData = payload.items;
        total =
          payload.totalCount ??
          payload.total ??
          payload.pagination?.total ??
          variantsData.length;
      } else if (Array.isArray(payload)) {
        variantsData = payload;
        total = variantsData.length;
      } else if (Array.isArray(response?.data?.items)) {
        variantsData = response.data.items;
        total = response.data.totalCount || variantsData.length;
      } else if (Array.isArray(response?.data)) {
        variantsData = response.data;
        total = variantsData.length;
      }

      variantsData = variantsData.sort((a, b) => {
        if (a.availableStock > 0 && b.availableStock === 0) return -1;
        if (a.availableStock === 0 && b.availableStock > 0) return 1;
        return 0;
      });

      setVariants(variantsData);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching vehicle variants:", error);
      message.error("Không thể tải danh sách biến thể xe");
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [dealerId, modelId]);

  useEffect(() => {
    if (dealerId && modelId) {
      fetchVariants();
    }
  }, [dealerId, modelId, fetchVariants]);

  return {
    variants,
    loading,
    pagination,
    fetchVariants,
  };
};

export default useDealerVehicleVariants;
