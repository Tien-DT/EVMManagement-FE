import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

// Dealer CRUD for admin scope
const basePath = endpoints.admin.dealers;

export const dealerService = {
  list: async (params = {}) => {
    return axiosInstance.get(basePath, { params });
  },
  getById: async (id) => {
    return axiosInstance.get(`${basePath}/${id}`);
  },
  create: async (payload) => {
    return axiosInstance.post(basePath, payload);
  },
  update: async (id, payload) => {
    return axiosInstance.put(`${basePath}/${id}`, payload);
  },
  remove: async (id) => {
    return axiosInstance.delete(`${basePath}/${id}`);
  },
};

export default dealerService;


