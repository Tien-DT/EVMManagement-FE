import axiosInstance from '../../../api/axiosInstance';

const dealerService = {
  // Get all dealers
  getAllDealers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/Dealers', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get dealer by ID
  getDealerById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/Dealers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dealerService;
