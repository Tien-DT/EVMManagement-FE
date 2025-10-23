import axiosInstance from '../../../api/axiosInstance';

const dealerContractService = {
  // Get all dealer contracts
  getAllContracts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/DealerContracts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get contract by ID
  getContractById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/DealerContracts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new dealer contract (POST method)
  createContract: async (contractData) => {
    try {
      const response = await axiosInstance.post('/v1/DealerContracts', contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update dealer contract
  updateContract: async (id, contractData) => {
    try {
      const response = await axiosInstance.put(`/v1/DealerContracts/${id}`, contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete dealer contract
  deleteContract: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/DealerContracts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get contracts by dealer ID
  getContractsByDealer: async (dealerId) => {
    try {
      const response = await axiosInstance.get(`/v1/DealerContracts/dealer/${dealerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update contract status
  updateContractStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/v1/DealerContracts/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get contracts by specific dealer ID
  getContractsBySpecificDealer: async (dealerId) => {
    try {
      const response = await axiosInstance.get(`/v1/DealerContracts/dealer/${dealerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific contract by ID
  getSpecificContract: async (contractId) => {
    try {
      const response = await axiosInstance.get(`/v1/DealerContracts/${contractId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP for contract
  verifyContractOTP: async (contractId, otpData) => {
    try {
      const response = await axiosInstance.post(`/v1/DealerContracts/${contractId}/verify-otp`, otpData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dealerContractService;
