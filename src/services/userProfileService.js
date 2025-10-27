import axiosInstance from "../api/axiosInstance";
import endpoints from "../api/endpoints";

export const userProfileService = {
  // Get all profiles
  getAll: async (params = {}) => {
    try {
      return await axiosInstance.get(endpoints.userProfile.getAll, { params });
    } catch (error) {
      throw error;
    }
  },

  // Get profile by ID
  getById: async (id) => {
    try {
      return await axiosInstance.get(endpoints.userProfile.getById(id));
    } catch (error) {
      throw error;
    }
  },

  // Get profile by account ID
  getByAccount: async (accId) => {
    try {
      return await axiosInstance.get(endpoints.userProfile.getByAccount(accId));
    } catch (error) {
      throw error;
    }
  },

  // Get profiles by role
  getByRole: async (role) => {
    try {
      return await axiosInstance.get(endpoints.userProfile.getByRole, {
        params: { role },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get profiles by dealer
  getByDealer: async (dealerId) => {
    try {
      return await axiosInstance.get(endpoints.userProfile.getByDealer(dealerId));
    } catch (error) {
      throw error;
    }
  },

  // Update profile by ID (PATCH)
  update: async (id, payload) => {
    try {
      return await axiosInstance.patch(endpoints.userProfile.update(id), payload);
    } catch (error) {
      throw error;
    }
  },

  // Update profile by account ID (PUT)
  updateByAccount: async (accId, payload) => {
    try {
      return await axiosInstance.put(endpoints.userProfile.updateByAccount(accId), payload);
    } catch (error) {
      throw error;
    }
  },
};

export default userProfileService;

