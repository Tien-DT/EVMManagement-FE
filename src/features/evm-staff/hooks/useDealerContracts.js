// src/features/evm-staff/hooks/useDealerContracts.js
import { useState, useEffect } from 'react';
import dealerContractService from '../services/dealerContractService';

const useDealerContracts = (autoFetch = true) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  /**
   * Fetch all dealer contracts with pagination
   * GET /api/v1/DealerContracts
   * @param {Object} params - { pageNumber, pageSize }
   */
  const fetchContracts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getAllContracts(params);
      console.log('Hook: Dealer contracts response:', response);
      
      // Response structure: { success, data: { items, pageNumber, ... }, errors }
      const contractsData = response.data || response;
      
      setContracts(contractsData.items || []);
      setPagination({
        pageNumber: contractsData.pageNumber || 1,
        pageSize: contractsData.pageSize || 10,
        totalCount: contractsData.totalCount || 0,
        totalPages: contractsData.totalPages || 0,
        hasNextPage: contractsData.hasNextPage || false,
        hasPreviousPage: contractsData.hasPreviousPage || false
      });
      return response;
    } catch (err) {
      console.error('Hook: Error fetching dealer contracts:', err);
      setError(err.message || 'Error fetching contracts');
      setContracts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get dealer contract by ID
   * GET /api/v1/DealerContracts/{id}
   * @param {string} id - Contract UUID
   */
  const getContractById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getContractById(id);
      console.log('Hook: Dealer contract by ID:', response);
      return response;
    } catch (err) {
      console.error('Hook: Error fetching contract by ID:', err);
      setError(err.message || 'Error fetching contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get contracts by dealer ID
   * GET /api/v1/DealerContracts/dealer/{dealerId}
   * @param {string} dealerId - Dealer UUID
   */
  const getContractsByDealer = async (dealerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getContractsByDealer(dealerId);
      console.log('Hook: Contracts by dealer:', response);
      const contractsData = response.data || response;
      setContracts(contractsData.items || contractsData || []);
      return response;
    } catch (err) {
      console.error('Hook: Error fetching contracts by dealer:', err);
      setError(err.message || 'Error fetching contracts by dealer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new dealer contract
   * POST /api/v1/DealerContracts
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
  const createContract = async (contractData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating dealer contract with data:', contractData);
      const response = await dealerContractService.createContract(contractData);
      console.log('Hook: Dealer contract created:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error creating dealer contract:', err);
      setError(err.message || 'Error creating contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP for dealer contract
   * POST /api/v1/DealerContracts/{dealerId}/verify-otp
   * @param {string} dealerId - Dealer UUID
   * @param {Object} otpData - { otp: string }
   */
  const verifyContractOTP = async (dealerId, otpData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Verifying OTP for dealer:', dealerId);
      const response = await dealerContractService.verifyContractOTP(dealerId, otpData);
      console.log('Hook: OTP verified:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error verifying OTP:', err);
      setError(err.message || 'Error verifying OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchContracts().catch(err => {
        console.error('Initial fetch contracts failed:', err);
      });
    }
  }, [autoFetch]);

  return {
    contracts,
    loading,
    error,
    pagination,
    fetchContracts,
    getContractById,
    getContractsByDealer,
    createContract,
    verifyContractOTP
  };
};

export default useDealerContracts;
