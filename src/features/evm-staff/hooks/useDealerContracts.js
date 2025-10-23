import { useState, useEffect } from 'react';
import dealerContractService from '../services/dealerContractService';

const useDealerContracts = () => {
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

  // Fetch all contracts with pagination
  const fetchContracts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getAllContracts(params);
      console.log('Hook: Contracts response:', response);
      
      // axiosInstance already returns response.data, so response is { items: [...], totalCount, ... }
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
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new contract (POST method)
  const createContract = async (contractData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating contract with data:', contractData);
      const response = await dealerContractService.createContract(contractData);
      console.log('Hook: Contract created successfully:', response);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      console.error('Hook: Error creating contract:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update contract
  const updateContract = async (id, contractData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.updateContract(id, contractData);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete contract
  const deleteContract = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.deleteContract(id);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update contract status
  const updateContractStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.updateContractStatus(id, status);
      // Refresh contracts list
      await fetchContracts();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get contract by ID - /v1/DealerContracts/{contractId}
  const getContractById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getContractById(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin hợp đồng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get contracts by dealer - /v1/DealerContracts/dealer/{dealerId}
  const getContractsByDealer = async (dealerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getContractsByDealer(dealerId);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải hợp đồng của đại lý');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get specific contract by ID - /v1/DealerContracts/{contractId}
  const getSpecificContract = async (contractId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.getSpecificContract(contractId);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin hợp đồng cụ thể');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify contract OTP - /v1/DealerContracts/{contractId}/verify-otp
  const verifyContractOTP = async (contractId, otpData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerContractService.verifyContractOTP(contractId, otpData);
      // Refresh contracts list after successful verification
      await fetchContracts();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts().catch(err => {
      console.error('Initial fetch contracts failed:', err);
    });
  }, []);

  return {
    contracts,
    loading,
    error,
    pagination,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    updateContractStatus,
    getContractById,
    getContractsByDealer,
    getSpecificContract,
    verifyContractOTP
  };
};

export default useDealerContracts;
