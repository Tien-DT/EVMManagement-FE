import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const promotionService = {
  // Get all promotions
  getAll: async () => {
    try {
      const response = await axiosInstance.get(endpoints.admin.promotions);
      console.log("Get promotions API response:", response);
      // Return the response data directly since axiosInstance already handles the response structure
      return response.data || response;
    } catch (error) {
      console.error("Get promotions service error:", error);
      throw error;
    }
  },

  // Get promotion by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${endpoints.admin.promotions}/${id}`);
      console.log("Get promotion by ID API response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Get promotion by ID service error:", error);
      throw error;
    }
  },

  // Create new promotion
  create: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.admin.promotions, data);
      console.log("Create promotion API response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Create promotion service error:", error);
      throw error;
    }
  },

  // Update promotion
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`${endpoints.admin.promotions}/${id}`, data);
      console.log("Update promotion API response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Update promotion service error:", error);
      throw error;
    }
  },

  // Delete promotion
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${endpoints.admin.promotions}/${id}`);
      console.log("Delete promotion API response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Delete promotion service error:", error);
      throw error;
    }
  },

};

export default promotionService;
