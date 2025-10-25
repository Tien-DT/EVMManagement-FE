// src/features/dealer-manager/hooks/useTimeSlots.js
import { useState, useEffect, useCallback } from "react";
import { masterTimeSlotService } from "../services/masterTimeSlotService";

export const useTimeSlots = (initialPageSize = 10) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await masterTimeSlotService.getAll(
        pagination.pageNumber,
        pagination.pageSize
      );

      // Đảm bảo items là array
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : [];

      setTimeSlots(items);
      setPagination({
        pageNumber: response.data?.pageNumber || 1,
        pageSize: response.data?.pageSize || initialPageSize,
        totalCount: response.data?.totalCount || 0,
        totalPages: response.data?.totalPages || 0,
      });
    } catch (err) {
      setError(err.message || "Không thể tải danh sách slot");
      setTimeSlots([]);
      console.error("Fetch time slots error:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, initialPageSize]);

  const deleteTimeSlot = useCallback(
    async (id) => {
      try {
        await masterTimeSlotService.delete(id);
        await fetchTimeSlots(); // Refresh data after delete
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || "Không thể xóa slot";
        console.error("Delete time slot error:", err);
        return { success: false, error: errorMessage };
      }
    },
    [fetchTimeSlots]
  );

  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  return {
    timeSlots,
    loading,
    error,
    pagination,
    fetchTimeSlots,
    deleteTimeSlot,
    changePage,
  };
};
