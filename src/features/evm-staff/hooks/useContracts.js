// src/features/evm-staff/hooks/useContracts.js
import { useState, useEffect } from 'react';
import contractService from '../services/contractService';

const useContracts = (autoFetch = true) => {
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
   * Fetch all contracts with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  const fetchContracts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractService.getAllContracts(params);
      console.log('Hook: Contracts response:', response);
      
      // Response structure: { success, data: { items, pageNumber, pageSize, totalCount, totalPages }, errors }
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
      console.error('Hook: Error fetching contracts:', err);
      setError(err.message || 'Error fetching contracts');
      setContracts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get contract by ID
   * @param {string} id - Contract UUID
   */
  const getContractById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractService.getContractById(id);
      console.log('Hook: Contract by ID response:', response);
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
   * Get contract by code
   * @param {string} code - Contract code (e.g., "CTR-CUST-0001")
   */
  const getContractByCode = async (code) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Fetching contract by code:', code);
      const response = await contractService.getContractByCode(code);
      console.log('Hook: Contract by code response:', response);
      return response;
    } catch (err) {
      console.error('Hook: Error fetching contract by code:', err);
      setError(err.message || 'Contract not found');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new contract
   * @param {Object} contractData - Contract data
   */
  const createContract = async (contractData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating contract with data:', contractData);
      const response = await contractService.createContract(contractData);
      console.log('Hook: Contract created successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error creating contract:', err);
      setError(err.message || 'Error creating contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update contract (full update)
   * @param {string} id - Contract UUID
   * @param {Object} contractData - Full contract data
   */
  const updateContract = async (id, contractData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Updating contract:', id, contractData);
      const response = await contractService.updateContract(id, contractData);
      console.log('Hook: Contract updated successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error updating contract:', err);
      setError(err.message || 'Error updating contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Patch contract (partial update)
   * @param {string} id - Contract UUID
   * @param {Object} partialData - Partial contract data
   */
  const patchContract = async (id, partialData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Patching contract:', id, partialData);
      const response = await contractService.patchContract(id, partialData);
      console.log('Hook: Contract patched successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error patching contract:', err);
      setError(err.message || 'Error patching contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete contract
   * @param {string} id - Contract UUID
   */
  const deleteContract = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Deleting contract:', id);
      const response = await contractService.deleteContract(id);
      console.log('Hook: Contract deleted successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error deleting contract:', err);
      setError(err.message || 'Error deleting contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update contract status
   * @param {string} id - Contract UUID
   * @param {string} status - DRAFT | PENDING_SIGNATURE | ACTIVE | CANCELED
   */
  const updateContractStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Updating contract status:', id, status);
      const response = await contractService.updateContractStatus(id, status);
      console.log('Hook: Contract status updated successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error updating contract status:', err);
      setError(err.message || 'Error updating contract status');
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
    getContractByCode,
    createContract,
    updateContract,
    patchContract,
    deleteContract,
    updateContractStatus
  };
};

export default useContracts;

