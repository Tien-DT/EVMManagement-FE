// src/features/dealer-manager/hooks/useDeposits.js
import { useState, useEffect, useCallback } from "react";
import { depositService } from "../services/depositService";

export const useDeposits = (autoFetch = true) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  /**
   * Fetch all deposits
   * @param {Object} params - { orderId, receivedByUserId, pageNumber, pageSize }
   */
  const fetchDeposits = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching deposits with params:", params);
      const response = await depositService.getAllDeposits(params);
      
      // Handle different response formats
      const data = response?.data || response;
      
      if (data?.items) {
        setDeposits(data.items);
        setPagination({
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          totalPages: data.totalPages || Math.ceil((data.total || 0) / (params.pageSize || 10)),
          totalItems: data.total || 0,
        });
      } else if (Array.isArray(data)) {
        setDeposits(data);
        setPagination({
          currentPage: 1,
          pageSize: data.length,
          totalPages: 1,
          totalItems: data.length,
        });
      } else {
        setDeposits([]);
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
      setError(err.message || "Failed to fetch deposits");
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get deposit by ID
   */
  const getDepositById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await depositService.getDepositById(id);
      return response?.data || response;
    } catch (err) {
      console.error("Error fetching deposit:", err);
      setError(err.message || "Failed to fetch deposit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new deposit
   */
  const createDeposit = async (depositData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating deposit with data:", depositData);
      const response = await depositService.createDeposit(depositData);
      // Refresh deposits list
      await fetchDeposits();
      return response;
    } catch (err) {
      console.error("Error creating deposit:", err);
      setError(err.message || "Failed to create deposit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update deposit
   */
  const updateDeposit = async (id, partialData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await depositService.updateDeposit(id, partialData);
      // Refresh deposits list
      await fetchDeposits();
      return response;
    } catch (err) {
      console.error("Error updating deposit:", err);
      setError(err.message || "Failed to update deposit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete deposit
   */
  const deleteDeposit = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await depositService.deleteDeposit(id);
      // Refresh deposits list
      await fetchDeposits();
      return response;
    } catch (err) {
      console.error("Error deleting deposit:", err);
      setError(err.message || "Failed to delete deposit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify deposit payment
   */
  const verifyDeposit = async (id, status = "CONFIRMED") => {
    setLoading(true);
    setError(null);
    try {
      const response = await depositService.verifyDeposit(id, status);
      // Refresh deposits list
      await fetchDeposits();
      return response;
    } catch (err) {
      console.error("Error verifying deposit:", err);
      setError(err.message || "Failed to verify deposit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get deposits by order ID
   */
  const getDepositsByOrder = async (orderId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await depositService.getDepositsByOrder(orderId, params);
      const data = response?.data || response;
      
      if (data?.items) {
        setDeposits(data.items);
        setPagination({
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          totalPages: data.totalPages || 1,
          totalItems: data.total || 0,
        });
      } else if (Array.isArray(data)) {
        setDeposits(data);
      } else {
        setDeposits([]);
      }
    } catch (err) {
      console.error("Error fetching deposits by order:", err);
      setError(err.message || "Failed to fetch deposits");
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchDeposits();
    }
  }, [autoFetch, fetchDeposits]);

  return {
    deposits,
    loading,
    error,
    pagination,
    fetchDeposits,
    getDepositById,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    verifyDeposit,
    getDepositsByOrder,
  };
};

export default useDeposits;

