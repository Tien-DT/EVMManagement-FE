// src/features/dealer-manager/services/masterTimeSlotService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const masterTimeSlotService = {
  // Get all time slots with pagination
  getAll: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.masterTimeSlots.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get time slots response:", response);
      return response;
    } catch (error) {
      console.error("Get time slots error:", error);
      throw error;
    }
  },

  // Get time slots by dealer with pagination
  getByDealer: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        endpoints.masterTimeSlots.getByDealer(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get time slots by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get time slots by dealer error:", error);
      throw error;
    }
  },

  // Get all active time slots by dealer (for checking limit)
  getAllActiveByDealer: async (dealerId) => {
    try {
      // Fetch with large pageSize to get all timeslots
      const response = await axiosInstance.get(
        endpoints.masterTimeSlots.getByDealer(dealerId),
        {
          params: {
            pageNumber: 1,
            pageSize: 100, // Large enough to get all timeslots
          },
        }
      );
      console.log("Get all active time slots by dealer response:", response);
      
      // Extract items from response
      const data = response?.data || response;
      const allSlots = data?.items || (Array.isArray(data) ? data : []);
      
      // Filter only active timeslots
      const activeSlots = allSlots.filter(slot => slot.isActive === true || slot.isActive === 1);
      
      return activeSlots;
    } catch (error) {
      console.error("Get all active time slots by dealer error:", error);
      throw error;
    }
  },

  // Get time slot by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.masterTimeSlots.getById(id));
      console.log("Get time slot by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get time slot by ID error:", error);
      throw error;
    }
  },

  // Create new time slot
  create: async (data) => {
    try {
      console.log("Create time slot request data:", data);
      const response = await axiosInstance.post(endpoints.masterTimeSlots.create, data);
      console.log("Create time slot response:", response);
      return response;
    } catch (error) {
      console.error("Create time slot error:", error);
      throw error;
    }
  },

  // Update time slot
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(endpoints.masterTimeSlots.update(id), data);
      console.log("Update time slot response:", response);
      return response;
    } catch (error) {
      console.error("Update time slot error:", error);
      throw error;
    }
  },

  // Update isActive status of time slot
  updateIsActive: async (id, isActive) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.masterTimeSlots.updateIsActive(id),
        null,
        {
          params: {
            isActive,
          },
        }
      );
      console.log("Update isActive response:", response);
      return response;
    } catch (error) {
      console.error("Update isActive error:", error);
      throw error;
    }
  },

  // Delete time slot
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.masterTimeSlots.delete(id));
      console.log("Delete time slot response:", response);
      return response;
    } catch (error) {
      console.error("Delete time slot error:", error);
      throw error;
    }
  },
};