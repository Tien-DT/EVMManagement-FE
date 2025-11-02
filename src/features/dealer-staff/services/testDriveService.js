// src/features/dealer-staff/services/testDriveService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const testDriveService = {
  // Test Drive Bookings APIs
  // GET /api/v1/TestDriveBookings/filter
  getTestDriveBookings: async (filters = {}) => {
    try {
      const params = {
        pageNumber: filters.pageNumber || 1,
        pageSize: filters.pageSize || 10,
        ...(filters.dealerId && { dealerId: filters.dealerId }),
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.status && { status: filters.status }),
      };

      // Remove undefined/null values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(endpoints.testDriveBookings.filter, {
        params,
      });
      console.log("Get test drive bookings response:", response);
      return response;
    } catch (error) {
      console.error("Get test drive bookings error:", error);
      throw error;
    }
  },

  // GET /api/v1/TestDriveBookings/{id}
  getTestDriveBookingById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.testDriveBookings.getById(id));
      console.log("Get test drive booking by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get test drive booking by ID error:", error);
      throw error;
    }
  },

  // POST /api/v1/TestDriveBookings
  createTestDriveBooking: async (bookingData) => {
    try {
      const response = await axiosInstance.post(
        endpoints.testDriveBookings.create,
        bookingData
      );
      console.log("Create test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Create test drive booking error:", error);
      throw error;
    }
  },

  // PUT /api/v1/TestDriveBookings/{id}
  updateTestDriveBooking: async (id, bookingData) => {
    try {
      const response = await axiosInstance.put(
        endpoints.testDriveBookings.update(id),
        bookingData
      );
      console.log("Update test drive booking response:", response);
      return response;
    } catch (error) {
      console.error("Update test drive booking error:", error);
      throw error;
    }
  },

  // PATCH /api/v1/TestDriveBookings/{id}/status
  updateTestDriveBookingStatus: async (id, status, additionalData = {}) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.testDriveBookings.updateStatus(id),
        {
          status,
          ...additionalData,
        }
      );
      console.log("Update test drive booking status response:", response);
      return response;
    } catch (error) {
      console.error("Update test drive booking status error:", error);
      throw error;
    }
  },

  // Vehicle Time Slots APIs
  // GET /api/v1/VehicleTimeSlots/by-dealer/{dealerId}
  getVehicleTimeSlotsByDealer: async (dealerId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicleTimeSlots.getByDealer(dealerId)
      );
      console.log("Get vehicle time slots by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get vehicle time slots by dealer error:", error);
      throw error;
    }
  },

  // GET /api/v1/VehicleTimeSlots/by-vehicle/{vehicleId}
  getVehicleTimeSlotsByVehicle: async (vehicleId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.vehicleTimeSlots.getByVehicle(vehicleId)
      );
      console.log("Get vehicle time slots by vehicle response:", response);
      return response;
    } catch (error) {
      console.error("Get vehicle time slots by vehicle error:", error);
      throw error;
    }
  },

  // POST /api/v1/VehicleTimeSlots
  createVehicleTimeSlot: async (slotData) => {
    try {
      const response = await axiosInstance.post(
        endpoints.vehicleTimeSlots.create,
        slotData
      );
      console.log("Create vehicle time slot response:", response);
      return response;
    } catch (error) {
      console.error("Create vehicle time slot error:", error);
      throw error;
    }
  },

  // PATCH /api/v1/VehicleTimeSlots/{id}/status
  updateVehicleTimeSlotStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.vehicleTimeSlots.updateStatus(id),
        { status }
      );
      console.log("Update vehicle time slot status response:", response);
      return response;
    } catch (error) {
      console.error("Update vehicle time slot status error:", error);
      throw error;
    }
  },

  // Available Slots APIs
  // GET /api/v1/AvailableSlots/by-dealer/{dealerId}
  getAvailableSlotsByDealer: async (dealerId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.availableSlots.getByDealer(dealerId)
      );
      console.log("Get available slots by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get available slots by dealer error:", error);
      throw error;
    }
  },

  // GET /api/v1/AvailableSlots/available
  getAvailableSlots: async (filters = {}) => {
    try {
      const params = {
        ...(filters.dealerId && { dealerId: filters.dealerId }),
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.slotDate && { slotDate: filters.slotDate }),
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(endpoints.availableSlots.getAvailable, {
        params,
      });
      console.log("Get available slots response:", response);
      return response;
    } catch (error) {
      console.error("Get available slots error:", error);
      throw error;
    }
  },

  // Master Time Slots APIs
  // GET /api/v1/MasterTimeSlots/active
  getActiveMasterTimeSlots: async () => {
    try {
      const response = await axiosInstance.get(endpoints.masterTimeSlots.getActive);
      console.log("Get active master time slots response:", response);
      return response;
    } catch (error) {
      console.error("Get active master time slots error:", error);
      throw error;
    }
  },
};

export default testDriveService;
