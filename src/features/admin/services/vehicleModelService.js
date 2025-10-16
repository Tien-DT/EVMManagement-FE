import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

// CRUD service for Vehicle Models
export const vehicleModelService = {
  // Simple GET: fetch all vehicle models (no params)
  getAll: async () => {
    return await axiosInstance.get(endpoints.admin.vehicleModels);
  },

  list: async (params = {}) => {
    const { page = 1, pageSize = 10, search = "" } = params;
    const query = new URLSearchParams({ page, pageSize, search }).toString();
    return await axiosInstance.get(`${endpoints.admin.vehicleModels}?${query}`);
  },

  getById: async (id) => {
    return await axiosInstance.get(`${endpoints.admin.vehicleModels}/${id}`);
  },

  create: async (payload) => {
    // Backend expects { dto: { ... } }
    return await axiosInstance.post(endpoints.admin.vehicleModels, { dto: payload });
  },

  update: async (id, payload) => {
    // Backend expects { dto: { ... } }
    return await axiosInstance.put(`${endpoints.admin.vehicleModels}/${id}`, { dto: payload });
  },

  remove: async (id) => {
    return await axiosInstance.delete(`${endpoints.admin.vehicleModels}/${id}`);
  },
};

export default vehicleModelService;


