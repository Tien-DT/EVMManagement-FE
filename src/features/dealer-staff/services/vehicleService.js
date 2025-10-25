// src/features/dealer-staff/services/vehicleService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const vehicleService = {
  // Get all vehicle models with pagination
  getModels: async (pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(endpoints.vehicles.getModels, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get models response:", response);
      return response;
    } catch (error) {
      console.error("Get models error:", error);
      throw error;
    }
  },

  // Get all variants by model ID with pagination
  getVariantsByModel: async (modelId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getVariantsByModel(modelId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get variants by model response:", response);
      return response;
    } catch (error) {
      console.error("Get variants by model error:", error);
      throw error;
    }
  },
};
