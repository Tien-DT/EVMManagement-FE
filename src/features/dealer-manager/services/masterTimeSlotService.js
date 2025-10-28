import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const masterTimeSlotService = {
  // Get all master time slots
  getAll: async (params = {}) => {
    try {
      return await axiosInstance.get(endpoints.masterTimeSlots.getAll, { params });
    } catch (error) {
      throw error;
    }
  },

  // Get master time slot by ID
  getById: async (id) => {
    try {
      return await axiosInstance.get(endpoints.masterTimeSlots.getById(id));
    } catch (error) {
      throw error;
    }
  },

  // Get active master time slots
  getActive: async (params = {}) => {
    try {
      return await axiosInstance.get(endpoints.masterTimeSlots.getActive, { params });
    } catch (error) {
      throw error;
    }
  },

  // Get master time slots by dealer ID
  getByDealerId: async (dealerId, params = {}) => {
    try {
      return await axiosInstance.get(endpoints.masterTimeSlots.getByDealer(dealerId), { params });
    } catch (error) {
      throw error;
    }
  },

  // Get active master time slots by dealer ID
  getActiveByDealerId: async (dealerId, params = {}) => {
    try {
      return await axiosInstance.get(endpoints.masterTimeSlots.getActiveByDealer(dealerId), { params });
    } catch (error) {
      throw error;
    }
  },

  // Create a new master time slot
  create: async (data) => {
    try {
      return await axiosInstance.post(endpoints.masterTimeSlots.create, data);
    } catch (error) {
      throw error;
    }
  },

  // Update a master time slot
  update: async (id, data) => {
    try {
      return await axiosInstance.put(endpoints.masterTimeSlots.update(id), data);
    } catch (error) {
      throw error;
    }
  },

  // Update the isActive status of a master time slot
  updateIsActive: async (id, isActive) => {
    try {
      return await axiosInstance.patch(endpoints.masterTimeSlots.updateIsActive(id), null, {
        params: { isActive }
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete a master time slot
  delete: async (id) => {
    try {
      return await axiosInstance.delete(endpoints.masterTimeSlots.delete(id));
    } catch (error) {
      throw error;
    }
  },

  // Helper function to format time from minutes
  formatTime: (minutes) => {
    if (minutes === null || minutes === undefined) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  },

  // Helper function to convert time string to minutes
  timeToMinutes: (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  },
};

export default masterTimeSlotService;
