// src/features/dealer-manager/services/dealerService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const dealerService = {
  // Warehouses
  getAllWarehouses: async () => {
    try {
      const response = await axiosInstance.get(endpoints.dealer.warehouses);
      console.log("✅ Get warehouses response:", response);
      return response;
    } catch (error) {
      console.error("❌ Get warehouses error:", error);
      throw error;
    }
  },

  createWarehouse: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.dealer.warehouses,
        data
      );
      console.log("✅ Create warehouse response:", response);
      return response;
    } catch (error) {
      console.error("❌ Create warehouse error:", error);
      throw error;
    }
  },

  updateWarehouse: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `${endpoints.dealer.warehouses}/${id}`,
        data
      );
      console.log("✅ Update warehouse response:", response);
      return response;
    } catch (error) {
      console.error("❌ Update warehouse error:", error);
      throw error;
    }
  },

  deleteWarehouse: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${endpoints.dealer.warehouses}/${id}`
      );
      console.log("✅ Delete warehouse response:", response);
      return response;
    } catch (error) {
      console.error("❌ Delete warehouse error:", error);
      throw error;
    }
  },

  // Register Staff
  registerStaff: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.dealer.registerStaff,
        data
      );
      console.log("✅ Register staff response:", response);
      return response;
    } catch (error) {
      console.error("❌ Register staff error:", error);
      throw error;
    }
  },

  // Get User Profile by Account ID
  getUserProfile: async (accId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.userProfile.getByAccount(accId)
      );
      console.log("✅ Get user profile response:", response);
      return response;
    } catch (error) {
      console.error("❌ Get user profile error:", error);
      throw error;
    }
  },
};
