// src/features/evm-staff/services/contractService.js
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const contractService = {
  /**
   * GET /api/v1/Contracts
   * Get all contracts with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  getAllContracts: async (params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log('Service: Fetching contracts with params:', { pageNumber, pageSize });
      const response = await axiosInstance.get(endpoints.contracts.getAll, {
        params: { pageNumber, pageSize }
      });
      console.log('Service: Contracts response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching contracts:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/Contracts/{id}
   * Get contract by ID
   * @param {string} id - Contract UUID
   */
  getContractById: async (id) => {
    try {
      console.log('Service: Fetching contract by ID:', id);
      const response = await axiosInstance.get(endpoints.contracts.getById(id));
      console.log('Service: Contract response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching contract by ID:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/Contracts
   * Create new contract
   * @param {Object} contractData - Contract data
   * {
   *   code: string,
   *   orderId: uuid,
   *   customerId: uuid,
   *   createdByUserId: uuid,
   *   terms: string,
   *   status: "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "CANCELED",
   *   signedAt: datetime (optional),
   *   contractLink: string (optional)
   * }
   */
  createContract: async (contractData) => {
    try {
      console.log('Service: Creating contract with data:', contractData);
      const response = await axiosInstance.post(endpoints.contracts.create, contractData);
      console.log('Service: Contract created:', response);
      return response;
    } catch (error) {
      console.error('Service: Error creating contract:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/Contracts/{id}
   * Update contract (full update)
   * @param {string} id - Contract UUID
   * @param {Object} contractData - Full contract data
   */
  updateContract: async (id, contractData) => {
    try {
      console.log('Service: Updating contract:', id, contractData);
      const response = await axiosInstance.put(endpoints.contracts.update(id), contractData);
      console.log('Service: Contract updated:', response);
      return response;
    } catch (error) {
      console.error('Service: Error updating contract:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/Contracts/{id}
   * Partially update contract
   * @param {string} id - Contract UUID
   * @param {Object} partialData - Partial contract data
   */
  patchContract: async (id, partialData) => {
    try {
      console.log('Service: Patching contract:', id, partialData);
      const response = await axiosInstance.patch(endpoints.contracts.update(id), partialData);
      console.log('Service: Contract patched:', response);
      return response;
    } catch (error) {
      console.error('Service: Error patching contract:', error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/Contracts/{id}
   * Delete contract
   * @param {string} id - Contract UUID
   */
  deleteContract: async (id) => {
    try {
      console.log('Service: Deleting contract:', id);
      const response = await axiosInstance.delete(endpoints.contracts.delete(id));
      console.log('Service: Contract deleted:', response);
      return response;
    } catch (error) {
      console.error('Service: Error deleting contract:', error);
      throw error;
    }
  },

  /**
   * Update contract status
   * @param {string} id - Contract UUID
   * @param {string} status - DRAFT | PENDING_SIGNATURE | ACTIVE | CANCELED
   */
  updateContractStatus: async (id, status) => {
    try {
      console.log('Service: Updating contract status:', id, status);
      const response = await axiosInstance.patch(endpoints.contracts.update(id), { status });
      console.log('Service: Contract status updated:', response);
      return response;
    } catch (error) {
      console.error('Service: Error updating contract status:', error);
      throw error;
    }
  },

  /**
   * Get contract by code
   * @param {string} code - Contract code (e.g., "CTR-CUST-0001")
   * @returns {Promise} Contract data
   */
  getContractByCode: async (code) => {
    try {
      console.log('Service: Searching contract by code:', code);
      // Fetch all contracts and filter by code
      // Note: This is not optimal for large datasets. Consider asking backend for a dedicated endpoint.
      const response = await axiosInstance.get(endpoints.contracts.getAll, {
        params: { pageNumber: 1, pageSize: 100 }
      });
      
      const contractsData = response.data || response;
      const contracts = contractsData.items || [];
      const contract = contracts.find(c => c.code === code);
      
      if (!contract) {
        throw new Error(`Contract with code "${code}" not found`);
      }
      
      console.log('Service: Contract found by code:', contract);
      return { data: contract };
    } catch (error) {
      console.error('Service: Error finding contract by code:', error);
      throw error;
    }
  },

  /**
   * Generate contract code from UUID (for display purposes)
   * @param {string} uuid - Contract UUID
   * @returns {string} Contract code (CNT-XXXXXXXX)
   */
  generateContractCode: (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `CNT-${shortId}`;
  }
};

export default contractService;

