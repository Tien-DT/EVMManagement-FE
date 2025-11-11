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
   * Enforces maximum 4 active timeslots per dealer
   * If trying to create when already have 4 active timeslots, creation will be blocked
   */
  const createMasterTimeSlot = async (slotData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating master time slot with data:", slotData);
      
      // If the new timeslot is set to active, check the limit
      if (slotData.isActive === true || slotData.isActive === 1) {
        const dealerIdToCheck = slotData.dealerId || dealerId;
        
        if (dealerIdToCheck) {
          // Fetch all active timeslots for this dealer
          const activeSlots = await masterTimeSlotService.getAllActiveByDealer(dealerIdToCheck);
          console.log(`Found ${activeSlots.length} active timeslots for dealer ${dealerIdToCheck}`);
          
          // If already have 4 or more active timeslots, block creation
          if (activeSlots.length >= 4) {
            const errorMessage = `Không thể tạo timeslot active mới. Dealer đã có tối đa 4 timeslots active (${activeSlots.length}/4). Vui lòng vô hiệu hóa (inactive) một timeslot trước khi tạo timeslot mới.`;
            console.error(errorMessage);
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
      
      // Create the new timeslot
      const response = await masterTimeSlotService.create(slotData);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId: slotData.dealerId || dealerId });
      
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
   * Also enforces maximum 4 active timeslots per dealer
   * Blocks update if trying to activate when already have 4 active
   */
  const updateMasterTimeSlot = async (id, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Updating master time slot ID:", id, "with data:", updateData);
      
      // If updating to active status, check the limit
      if (updateData.isActive === true || updateData.isActive === 1) {
        const dealerIdToCheck = updateData.dealerId || dealerId;
        
        if (dealerIdToCheck) {
          // Fetch all active timeslots for this dealer (excluding the current one being updated)
          const activeSlots = await masterTimeSlotService.getAllActiveByDealer(dealerIdToCheck);
          const activeSlotsExcludingCurrent = activeSlots.filter(slot => slot.id !== id);
          console.log(`Found ${activeSlotsExcludingCurrent.length} active timeslots (excluding current) for dealer ${dealerIdToCheck}`);
          
          // If already have 4 or more active timeslots (excluding current), block update
          if (activeSlotsExcludingCurrent.length >= 4) {
            const errorMessage = `Không thể kích hoạt timeslot này. Dealer đã có tối đa 4 timeslots active (${activeSlotsExcludingCurrent.length}/4). Vui lòng vô hiệu hóa (inactive) một timeslot khác trước.`;
            console.error(errorMessage);
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
      
      const response = await masterTimeSlotService.update(id, updateData);
      // Refresh list
      await fetchMasterTimeSlots({ dealerId: updateData.dealerId || dealerId });
      
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
   * Enforces maximum 4 active timeslots per dealer
   * Blocks activation if already have 4 active timeslots
   */
  const updateIsActive = async (id, isActive) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Updating isActive for master time slot ID:", id, "to:", isActive);
      
      // If activating a timeslot, check the limit
      if (isActive === true || isActive === 1) {
        if (dealerId) {
          // Fetch all active timeslots for this dealer (excluding the current one)
          const activeSlots = await masterTimeSlotService.getAllActiveByDealer(dealerId);
          const activeSlotsExcludingCurrent = activeSlots.filter(slot => slot.id !== id);
          console.log(`Found ${activeSlotsExcludingCurrent.length} active timeslots (excluding current) for dealer ${dealerId}`);
          
          // If already have 4 or more active timeslots (excluding current), block activation
          if (activeSlotsExcludingCurrent.length >= 4) {
            const errorMessage = `Không thể kích hoạt timeslot này. Dealer đã có tối đa 4 timeslots active (${activeSlotsExcludingCurrent.length}/4). Vui lòng vô hiệu hóa (inactive) một timeslot khác trước.`;
            console.error(errorMessage);
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
      
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
