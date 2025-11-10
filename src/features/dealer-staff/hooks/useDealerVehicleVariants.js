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
      console.warn("⚠️ No dealerId or modelId provided", { dealerId, modelId });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log(`🚗 Fetching variants for dealerId: ${dealerId}, modelId: ${modelId}`);
      const response = await vehicleService.getVehicleVariantsWithStock(
        dealerId,
        modelId,
        page,
        pageSize
      );

      console.log("📦 Variants API Response:", response);

      let variantsData = [];
      let total = 0;

      // Handle different response structures (axiosInstance returns response.data)
      if (response?.success && response?.data) {
        // Structure: { success: true, data: { items: [...], totalCount: ... } }
        const data = response.data;
        if (Array.isArray(data.items)) {
          variantsData = data.items;
          total = data.totalCount ?? data.total ?? variantsData.length;
        } else if (Array.isArray(data)) {
          variantsData = data;
          total = variantsData.length;
        }
      } else if (Array.isArray(response?.items)) {
        // Structure: { items: [...], totalCount: ... }
        variantsData = response.items;
        total = response.totalCount ?? response.total ?? variantsData.length;
      } else if (Array.isArray(response)) {
        // Structure: [...]
        variantsData = response;
        total = variantsData.length;
      } else if (response?.data) {
        // Structure: { data: { items: [...], totalCount: ... } }
        const data = response.data;
        if (Array.isArray(data.items)) {
          variantsData = data.items;
          total = data.totalCount ?? data.total ?? variantsData.length;
        } else if (Array.isArray(data)) {
          variantsData = data;
          total = variantsData.length;
        }
      }

      console.log(`✅ Parsed variants data:`, variantsData);
      console.log(`📊 Total variants: ${total}`);

      // Sort by available stock (variants with stock first)
      if (variantsData.length > 0) {
        variantsData = variantsData.sort((a, b) => {
          const stockA = a.availableStock ?? a.stock ?? 0;
          const stockB = b.availableStock ?? b.stock ?? 0;
          if (stockA > 0 && stockB === 0) return -1;
          if (stockA === 0 && stockB > 0) return 1;
          return 0;
        });
      }

      setVariants(variantsData);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("❌ Error fetching vehicle variants:", error);
      console.error("Error details:", error.response?.data || error.message);
      message.error("Không thể tải danh sách biến thể xe: " + (error.message || "Đã có lỗi xảy ra"));
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
