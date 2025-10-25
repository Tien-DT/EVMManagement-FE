// src/features/dealer-staff/services/vehicleService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const vehicleService = {
  // Get all vehicle models by dealer ID
  getModelsByDealer: async (dealerId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getModelsByDealer(dealerId)
      );
      console.log("Get models by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get models by dealer error:", error);
      throw error;
    }
  },

  // Get all variants by dealer ID and model ID
  getVariantsByDealerAndModel: async (dealerId, modelId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getVariantsByDealerAndModel(dealerId, modelId)
      );
      console.log("Get variants by dealer and model response:", response);
      return response;
    } catch (error) {
      console.error("Get variants by dealer and model error:", error);
      throw error;
    }
  },
};
