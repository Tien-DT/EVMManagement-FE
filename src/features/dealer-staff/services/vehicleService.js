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

  // Get vehicle models by dealer ID with pagination
  getModelsByDealer: async (dealerId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getModelsByDealer(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get models by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get models by dealer error:", error);
      throw error;
    }
  },

  // Get variants by dealer and model ID with pagination
  getVariantsByDealerAndModel: async (dealerId, modelId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getVariantsByDealerAndModel(dealerId, modelId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get variants by dealer and model response:", response);
      return response;
    } catch (error) {
      console.error("Get variants by dealer and model error:", error);
      throw error;
    }
  },

  // Get vehicles by dealer and variant ID with pagination
  getVehiclesByDealerAndVariant: async (dealerId, variantId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getVehiclesByDealerAndVariant(dealerId, variantId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get vehicles by dealer and variant response:", response);
      return response;
    } catch (error) {
      console.error("Get vehicles by dealer and variant error:", error);
      throw error;
    }
  },
};
