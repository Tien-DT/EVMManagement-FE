import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const vehicleService = {
  getVehicleModelsWithStock: async (dealerId, pageNumber = 1, pageSize = 100) => {
    try {
      // Endpoint already includes dealerId in query string, axios will merge additional params
      const response = await axiosInstance.get(endpoints.vehicleModels.getAllWithStock(dealerId), {
        params: { pageNumber, pageSize },
      });
      console.log("🚗 getVehicleModelsWithStock response:", response);
      return response;
    } catch (error) {
      console.error("❌ Get vehicle models with stock error:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  getVehicleModelsByDealer: async (dealerId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(endpoints.vehicleModels.getByDealer(dealerId), {
        params: { pageNumber, pageSize },
      });
      return response;
    } catch (error) {
      console.error("Get vehicle models by dealer error:", error);
      throw error;
    }
  },

  // Alias for consistency
  getModelsByDealer: async (dealerId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(endpoints.vehicleModels.getByDealer(dealerId), {
        params: { pageNumber, pageSize },
      });
      return response;
    } catch (error) {
      console.error("Get vehicle models by dealer error:", error);
      throw error;
    }
  },

  getVehicleVariantsWithStock: async (dealerId, modelId, pageNumber = 1, pageSize = 100) => {
    try {
      console.log(`🚗 Fetching variants with stock for dealerId: ${dealerId}, modelId: ${modelId}`);
      const response = await axiosInstance.get(
        endpoints.vehicleVariants.getByDealerAndModelWithStock(dealerId, modelId),
        { params: { pageNumber, pageSize } }
      );
      console.log(`📦 getVehicleVariantsWithStock response for model ${modelId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Get vehicle variants with stock error for model ${modelId}:`, error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  getVehicleVariantsByDealerAndModel: async (dealerId, modelId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicleVariants.getByDealerAndModel(dealerId, modelId),
        { params: { pageNumber, pageSize } }
      );
      return response;
    } catch (error) {
      console.error("Get vehicle variants by dealer and model error:", error);
      throw error;
    }
  },

  getVehiclesByDealerAndVariant: async (dealerId, variantId, pageNumber = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicles.getByDealerAndVariant(dealerId, variantId),
        { params: { pageNumber, pageSize } }
      );
      return response;
    } catch (error) {
      console.error("Get vehicles by dealer and variant error:", error);
      throw error;
    }
  },

  createOrderWithDetails: async (orderData) => {
    try {
      const response = await axiosInstance.post("/v1/Orders/with-details", orderData);
      return response;
    } catch (error) {
      console.error("Create order with details error:", error);
      throw error;
    }
  },
};

export default vehicleService;
