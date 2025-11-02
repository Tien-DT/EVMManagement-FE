// src/features/dealer-staff/hooks/useTestDriveBookings.js
import { useState, useEffect, useCallback } from "react";
import { testDriveService } from "../services/testDriveService";
import { message } from "antd";

export const useTestDriveBookings = (dealerId, filters = {}) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const fetchBookings = useCallback(
    async (pageNumber = 1, pageSize = 10) => {
      if (!dealerId) {
        console.log("No dealerId provided, skipping fetch");
        setError("Dealer ID is required");
        setIsLoading(false);
        return;
      }

      console.log(
        "Fetching test drive bookings for dealerId:",
        dealerId,
        "page:",
        pageNumber
      );
      setIsLoading(true);
      setError(null);

      try {
        const filterParams = {
          dealerId,
          pageNumber,
          pageSize,
          ...filters,
        };

        const response = await testDriveService.getTestDriveBookings(filterParams);

        console.log("Test drive bookings API response:", response);

        if (response.success && response.data) {
          let bookingsData = [];

          if (Array.isArray(response.data.items)) {
            bookingsData = response.data.items;
          } else if (Array.isArray(response.data.data)) {
            bookingsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            bookingsData = response.data;
          }

          setBookings(bookingsData);
          setPagination({
            currentPage: response.data.pageNumber || pageNumber,
            pageSize: response.data.pageSize || pageSize,
            totalPages: response.data.totalPages || 0,
            totalItems: response.data.totalItems || bookingsData.length,
          });
        } else {
          console.error("Response not successful or no data:", response);
          setError(response.message || "Failed to fetch test drive bookings");
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching test drive bookings:", err);
        setError(err.message || "Failed to fetch test drive bookings");
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    },
    [dealerId, JSON.stringify(filters)]
  );

  const refreshBookings = useCallback(() => {
    fetchBookings(pagination.currentPage, pagination.pageSize);
  }, [fetchBookings, pagination.currentPage, pagination.pageSize]);

  const changePage = useCallback(
    (newPage) => {
      fetchBookings(newPage, pagination.pageSize);
    },
    [fetchBookings, pagination.pageSize]
  );

  const updateBookingStatus = useCallback(
    async (id, status, additionalData = {}) => {
      try {
        const response = await testDriveService.updateTestDriveBookingStatus(
          id,
          status,
          additionalData
        );
        if (response.success) {
          message.success("Cập nhật trạng thái thành công");
          refreshBookings();
          return { success: true, data: response.data };
        } else {
          message.error(response.message || "Không thể cập nhật trạng thái");
          return { success: false, message: response.message };
        }
      } catch (err) {
        console.error("Error updating booking status:", err);
        message.error(err.message || "Lỗi khi cập nhật trạng thái");
        return { success: false, message: err.message };
      }
    },
    [refreshBookings]
  );

  useEffect(() => {
    if (dealerId) {
      fetchBookings(1, 10);
    }
  }, [dealerId, fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    pagination,
    refreshBookings,
    changePage,
    updateBookingStatus,
  };
};

export default useTestDriveBookings;
