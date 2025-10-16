import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const basePath = endpoints.admin.dealers;

export const dealerService = {
  list: async (params = {}) => {
    try {
      return await axiosInstance.get(basePath, { params });
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await axiosInstance.get(`${basePath}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  create: async (payload) => {
    try {
      return await axiosInstance.post(basePath, payload);
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      return await axiosInstance.put(`${basePath}/${id}`, payload);
    } catch (error) {
      throw error;
    }
  },

  remove: async (id) => {
    try {
      return await axiosInstance.delete(`${basePath}/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default dealerService;