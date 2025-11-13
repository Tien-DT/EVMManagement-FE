// src/features/dealer-staff/services/testDriveBookingService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const testDriveBookingService = {
  // Get all test drive bookings with pagination
  getAll: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.testDriveBookings.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all test drive bookings response:", response);
      return response;
    } catch (error) {
      console.error("Get all test drive bookings error:", error);
      throw error;
    }
  },

  // Get test drive booking by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.testDriveBookings.getById(id));
      console.log("Get test drive booking by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get test drive booking by ID error:", error);
      throw error;
    }
  },

  // Get test drive bookings by dealer
  getByDealer: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        endpoints.testDriveBookings.getByDealer(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get test drive bookings by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get test drive bookings by dealer error:", error);
      throw error;
    }
  },

  // Filter test drive bookings by dealerId, customerId, status
  filter: async (filters = {}) => {
    try {
      const {
        dealerId,
        customerId,
        status,
        pageNumber = 1,
        pageSize = 10,
      } = filters;

      const params = {
        pageNumber,
        pageSize,
      };

      // Only include filter params if they are provided
      if (dealerId) params.dealerId = dealerId;
      if (customerId) params.customerId = customerId;
      if (status) params.status = status;

      console.log("Filtering test drive bookings with params:", params);
      const response = await axiosInstance.get(endpoints.testDriveBookings.filter, {
        params,
      });
      console.log("Filter test drive bookings response:", response);
      return response;
    } catch (error) {
      console.error("Filter test drive bookings error:", error);
      throw error;
    }
  },

  // Create new test drive booking
  create: async (data) => {
    try {
      console.log("Creating test drive booking with data:", data);
      const response = await axiosInstance.post(endpoints.testDriveBookings.create, data);
      console.log("Create test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Create test drive booking error:", error);
      throw error;
    }
  },

  // Update test drive booking
  update: async (id, data) => {
    try {
      console.log("Updating test drive booking:", id, data);
      const response = await axiosInstance.put(endpoints.testDriveBookings.update(id), data);
      console.log("Update test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Update test drive booking error:", error);
      throw error;
    }
  },

  // Update check-in and check-out times
  // When check-in: only send checkinAt, checkoutAt = null
  // When check-out: only send checkoutAt, checkinAt = null
  updateCheckInOut: async (id, checkinAt, checkoutAt, action = null) => {
    try {
      console.log("Updating check-in/check-out for booking:", id, { checkinAt, checkoutAt, action });
      
      const data = {};

      if (action === "checkin") {
        // Check-in: only send checkinAt, checkoutAt must be null
        if (!checkinAt) {
          throw new Error("Thời gian check-in là bắt buộc");
        }
        data.checkinAt = new Date(checkinAt).toISOString();
        data.checkoutAt = null; // Always set to null when check-in
      } else if (action === "checkout") {
        // Check-out: only send checkoutAt, checkinAt must be null
        if (!checkoutAt) {
          throw new Error("Thời gian check-out là bắt buộc");
        }
        data.checkoutAt = new Date(checkoutAt).toISOString();
        data.checkinAt = null; // Always set to null when check-out
      } else {
        // Manual update: this should not happen in normal flow
        // But if it does, treat as check-in if checkinAt provided, check-out if checkoutAt provided
        if (checkinAt && !checkoutAt) {
          data.checkinAt = new Date(checkinAt).toISOString();
          data.checkoutAt = null;
        } else if (checkoutAt && !checkinAt) {
          data.checkoutAt = new Date(checkoutAt).toISOString();
          data.checkinAt = null;
        } else {
          throw new Error("Chỉ có thể cập nhật một trường tại một thời điểm (check-in hoặc check-out)");
        }
      }

      console.log("Sending update request with data:", data);
      const response = await axiosInstance.put(endpoints.testDriveBookings.update(id), data);
      console.log("Update check-in/check-out response:", response);
      return response;
    } catch (error) {
      console.error("Update check-in/check-out error:", error);
      throw error;
    }
  },

  // Cancel test drive booking (using PATCH with status query param)
  cancelBooking: async (id) => {
    try {
      console.log("Canceling test drive booking:", id);
      const response = await axiosInstance.patch(
        `${endpoints.testDriveBookings.updateStatus(id)}?status=CANCELED`
      );
      console.log("Cancel test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Cancel test drive booking error:", error);
      throw error;
    }
  },

  // Delete test drive booking
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.testDriveBookings.delete(id));
      console.log("Delete test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Delete test drive booking error:", error);
      throw error;
    }
  },

  // Send confirmation for test drive booking
  sendConfirmation: async (id) => {
    try {
      console.log("Sending confirmation for test drive booking:", id);
      const response = await axiosInstance.post(endpoints.testDriveBookings.sendConfirmation(id));
      console.log("Send confirmation response:", response);
      return response;
    } catch (error) {
      console.error("Send confirmation error:", error);
      throw error;
    }
  },

  // Send reminder for test drive bookings (multiple IDs)
  sendReminder: async (ids) => {
    try {
      console.log("Sending reminder for test drive bookings:", ids);
      // ids should be an array of strings
      const idsArray = Array.isArray(ids) ? ids : [ids];
      const response = await axiosInstance.post(endpoints.testDriveBookings.sendReminder, null, {
        params: {
          ids: idsArray,
        },
      });
      console.log("Send reminder response:", response);
      return response;
    } catch (error) {
      console.error("Send reminder error:", error);
      throw error;
    }
  },
};
