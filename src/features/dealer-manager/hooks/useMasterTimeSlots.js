// src/features/dealer-manager/hooks/useMasterTimeSlots.js
import { useState, useEffect, useCallback } from "react";
import { masterTimeSlotService } from "../services/masterTimeSlotService";

export const useMasterTimeSlots = (dealerId, autoFetch = true) => {
  const [masterTimeSlots, setMasterTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  /**
   * Fetch all master time slots by dealer
   * @param {Object} params - { dealerId, pageNumber, pageSize }
   */
  const fetchMasterTimeSlots = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const { pageNumber = 1, pageSize = 10 } = params;
        const targetDealerId = params.dealerId || dealerId;

        if (!targetDealerId) {
          setError("Dealer ID is required");
          setLoading(false);
          return;
        }

        console.log("Fetching master time slots with params:", params);
        const response = await masterTimeSlotService.getByDealer(
          targetDealerId,
          pageNumber,
          pageSize
        );

        console.log("Master time slots API response:", response);
        console.log("Response type:", typeof response);
        console.log("Response.data type:", typeof response?.data);

        // Handle different response formats
        const data = response?.data || response;
        console.log("Processed data:", data);

        if (data?.items) {
          setMasterTimeSlots(data.items);
          setPagination({
            currentPage: pageNumber || 1,
            pageSize: pageSize || 10,
            totalPages: data.totalPages || Math.ceil((data.total || 0) / pageSize),
            totalItems: data.total || 0,
          });
        } else if (Array.isArray(data)) {
          setMasterTimeSlots(data);
          setPagination({
            currentPage: 1,
            pageSize: data.length,
            totalPages: 1,
            totalItems: data.length,
          });
        } else {
          setMasterTimeSlots([]);
        }
      } catch (err) {
        console.error("Error fetching master time slots:", err);
        setError(err.message || "Failed to fetch master time slots");
        setMasterTimeSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [dealerId]
  );

  /**
   * Get master time slot by ID
   */
  const getMasterTimeSlotById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await masterTimeSlotService.getById(id);
      return response?.data || response;
    } catch (err) {
      console.error("Error fetching master time slot:", err);
      setError(err.message || "Failed to fetch master time slot");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new master time slot
   */
  const createMasterTimeSlot = async (slotData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating master time slot with data:", slotData);
      const response = await masterTimeSlotService.create(slotData);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId });
      return response;
    } catch (err) {
      console.error("Error creating master time slot:", err);
      setError(err.message || "Failed to create master time slot");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update master time slot
   */
  const updateMasterTimeSlot = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Updating master time slot ID:", id, "with data:", updateData);
      const response = await masterTimeSlotService.update(id, updateData);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId });
      return response;
    } catch (err) {
      console.error("Error updating master time slot:", err);
      setError(err.message || "Failed to update master time slot");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update isActive status of master time slot
   */
  const updateIsActive = async (id, isActive) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Updating isActive for master time slot ID:", id, "to:", isActive);
      const response = await masterTimeSlotService.updateIsActive(id, isActive);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId });
      return response;
    } catch (err) {
      console.error("Error updating isActive:", err);
      setError(err.message || "Failed to update isActive status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete master time slot
   */
  const deleteMasterTimeSlot = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Deleting master time slot ID:", id);
      const response = await masterTimeSlotService.delete(id);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId });
      return response;
    } catch (err) {
      console.error("Error deleting master time slot:", err);
      setError(err.message || "Failed to delete master time slot");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change page
   */
  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  }, []);

  // Auto-fetch on mount and when dealerId changes
  useEffect(() => {
    if (autoFetch && dealerId) {
      fetchMasterTimeSlots({ dealerId });
    }
  }, [autoFetch, dealerId, fetchMasterTimeSlots]);

  return {
    masterTimeSlots,
    loading,
    error,
    pagination,
    fetchMasterTimeSlots,
    getMasterTimeSlotById,
    createMasterTimeSlot,
    updateMasterTimeSlot,
    updateIsActive,
    deleteMasterTimeSlot,
    changePage,
  };
};
