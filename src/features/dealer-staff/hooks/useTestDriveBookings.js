// src/features/dealer-staff/hooks/useTestDriveBookings.js
import { useState, useEffect, useCallback } from "react";
import { testDriveBookingService } from "../services/testDriveBookingService";

export const useTestDriveBookings = (filters = {}, autoFetch = true) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const fetchBookings = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...filters, ...filterParams };
      const response = await testDriveBookingService.filter(mergedFilters);

      console.log("Test drive bookings API response:", response);

      // Handle different response formats
      const data = response?.data || response;

      if (data?.items) {
        setBookings(data.items);
        setPagination({
          currentPage: data.pageNumber || mergedFilters.pageNumber || 1,
          pageSize: data.pageSize || mergedFilters.pageSize || 10,
          totalPages: data.totalPages || 0,
          totalItems: data.total || data.totalCount || 0,
        });
      } else if (Array.isArray(data)) {
        setBookings(data);
        setPagination({
          currentPage: mergedFilters.pageNumber || 1,
          pageSize: mergedFilters.pageSize || 10,
          totalPages: 1,
          totalItems: data.length,
        });
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching test drive bookings:", err);
      setError(err.message || "Failed to fetch test drive bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchBookings();
    }
  }, [autoFetch, fetchBookings]);

  const changePage = useCallback((pageNumber) => {
    fetchBookings({ pageNumber });
  }, [fetchBookings]);

  const changePageSize = useCallback((pageSize) => {
    fetchBookings({ pageNumber: 1, pageSize });
  }, [fetchBookings]);

  const refresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    changePage,
    changePageSize,
    refresh,
  };
};
