// src/features/evm-staff/services/dealerContractService.js
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const dealerContractService = {
  /**
   * GET /api/v1/DealerContracts
   * Get all dealer contracts with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  getAllContracts: async (params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log('Service: Fetching dealer contracts with params:', { pageNumber, pageSize });
      const response = await axiosInstance.get(endpoints.dealerContracts.getAll, {
        params: { pageNumber, pageSize }
      });
      console.log('Service: Dealer contracts response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching dealer contracts:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/DealerContracts/{id}
   * Get dealer contract by ID
   * @param {string} id - Contract UUID
   */
  getContractById: async (id) => {
    try {
      console.log('Service: Fetching dealer contract by ID:', id);
      const response = await axiosInstance.get(endpoints.dealerContracts.getById(id));
      console.log('Service: Dealer contract response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching dealer contract by ID:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/DealerContracts/dealer/{dealerId}
   * Get contracts by dealer ID
   * @param {string} dealerId - Dealer UUID
   */
  getContractsByDealer: async (dealerId) => {
    try {
      console.log('Service: Fetching contracts by dealer ID:', dealerId);
      const response = await axiosInstance.get(endpoints.dealerContracts.getByDealer(dealerId));
      console.log('Service: Dealer contracts response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching contracts by dealer:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/DealerContracts
   * Create new dealer contract
   * @param {Object} contractData
   * {
   *   dealerId: uuid,
   *   contractCode: string,
   *   terms: string,
   *   status: "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "CANCELED",
   *   effectiveDate: datetime,
   *   expirationDate: datetime,
   *   contractLink: string (optional)
   * }
   */
  createContract: async (contractData) => {
    try {
      console.log('📝 Service: Creating dealer contract with data:', JSON.stringify(contractData, null, 2));
      console.log('📝 Service: Data being sent:', contractData);
      
      // Ensure dates are properly formatted
      const formattedData = {
        ...contractData,
        effectiveDate: contractData.effectiveDate ? new Date(contractData.effectiveDate).toISOString() : null,
        expirationDate: contractData.expirationDate ? new Date(contractData.expirationDate).toISOString() : null,
      };
      
      console.log('📝 Service: Formatted data:', JSON.stringify(formattedData, null, 2));
      
      const response = await axiosInstance.post(endpoints.dealerContracts.create, formattedData);
      console.log('✅ Service: Dealer contract created:', response);
      return response;
    } catch (error) {
      console.error('❌ Service: Error creating dealer contract:', error);
      console.error('❌ Service: Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * PUT /api/v1/DealerContracts/{id}
   * Update dealer contract
   * @param {string} id - Contract UUID
   * @param {Object} contractData
   */
  updateContract: async (id, contractData) => {
    try {
      console.log('📝 Service: Updating dealer contract:', id);
      console.log('📝 Service: Update data:', JSON.stringify(contractData, null, 2));
      
      // Ensure dates are properly formatted
      const formattedData = {
        ...contractData,
        effectiveDate: contractData.effectiveDate ? new Date(contractData.effectiveDate).toISOString() : null,
        expirationDate: contractData.expirationDate ? new Date(contractData.expirationDate).toISOString() : null,
      };
      
      console.log('📝 Service: Formatted update data:', JSON.stringify(formattedData, null, 2));
      
      const response = await axiosInstance.put(endpoints.dealerContracts.update(id), formattedData);
      console.log('✅ Service: Dealer contract updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Service: Error updating dealer contract:', error);
      console.error('❌ Service: Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * POST /api/v1/DealerContracts/{dealerId}/verify-otp
   * Verify OTP for dealer contract
   * @param {string} dealerId - Dealer UUID
   * @param {Object} otpData - { otp: string }
   */
  verifyContractOTP: async (dealerId, otpData) => {
    try {
      console.log('Service: Verifying OTP for dealer:', dealerId);
      const response = await axiosInstance.post(endpoints.dealerContracts.verifyOtp(dealerId), otpData);
      console.log('Service: OTP verified:', response);
      return response;
    } catch (error) {
      console.error('Service: Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Generate contract code from UUID
   * @param {string} uuid - Contract UUID
   * @returns {string} Contract code (CNT-XXXXXXXX)
   */
  generateContractCode: (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `CNT-${shortId}`;
  }
};

export default dealerContractService;
