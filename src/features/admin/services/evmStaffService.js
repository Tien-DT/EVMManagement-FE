import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const basePath = endpoints.admin.evmStaff;

export const evmStaffService = {
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
      // Sử dụng PATCH thay vì PUT
      return await axiosInstance.patch(`${basePath}/${id}`, payload);
    } catch (error) {
      throw error;
    }
  },
  
  // Update by account ID (sử dụng PATCH với accountId)
  updateByAccountId: async (accountId, payload) => {
    try {
      return await axiosInstance.patch(endpoints.userProfile.update(accountId), payload);
    } catch (error) {
      throw error;
    }
  },

  remove: async (id, accountId = null) => {
    try {
      // DELETE /v1/UserProfile/{id}?isDeleted=true
      // According to API: id (path, required), isDeleted (query, optional boolean)
      
      // Try with accountId first if available (more reliable)
      if (accountId) {
        try {
          return await axiosInstance.delete(`${basePath}/${accountId}`, {
            params: { isDeleted: true }
          });
        } catch (accIdError) {
          console.warn("Delete with accountId failed, trying with id:", accIdError);
          // Fall through to try with id
        }
      }
      
      // Try DELETE with id and isDeleted=true query param
      try {
        return await axiosInstance.delete(`${basePath}/${id}`, {
          params: { isDeleted: true }
        });
      } catch (idError) {
        console.error("Error deleting with id:", idError);
        throw idError;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default evmStaffService;

