// src/features/evm-staff/services/handoverRecordService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const handoverRecordService = {
  // Get all handover records with pagination
  getAllHandoverRecords: async (params = {}) => {
    try {
      console.log('Service: Fetching handover records with params:', params);
      const response = await axiosInstance.get(endpoints.handoverRecords.getAll, { params });
      console.log('Service: Handover records response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching handover records:', error);
      throw error;
    }
  },

  // Get handover record by ID
  getHandoverRecordById: async (id) => {
    try {
      console.log('Service: Fetching handover record by ID:', id);
      const response = await axiosInstance.get(endpoints.handoverRecords.getById(id));
      console.log('Service: Handover record by ID response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error fetching handover record by ID:', error);
      throw error;
    }
  },

  // Create new handover record
  createHandoverRecord: async (data) => {
    try {
      console.log('Service: Creating handover record');
      console.log('Service: Handover record data:', data);
      const response = await axiosInstance.post(endpoints.handoverRecords.create, data);
      console.log('Service: Create handover record response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error creating handover record:', error);
      console.error('Service: Error response:', error.response);
      throw error;
    }
  },

  // Update handover record
  updateHandoverRecord: async (id, data) => {
    try {
      console.log('Service: Updating handover record ID:', id);
      console.log('Service: Update data:', data);
      const response = await axiosInstance.put(endpoints.handoverRecords.update(id), data);
      console.log('Service: Update handover record response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error updating handover record:', error);
      throw error;
    }
  },

  // Delete handover record (soft delete via PATCH)
  deleteHandoverRecord: async (id) => {
    try {
      console.log('Service: Deleting handover record ID:', id);
      const response = await axiosInstance.patch(endpoints.handoverRecords.delete(id));
      console.log('Service: Delete handover record response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error deleting handover record:', error);
      throw error;
    }
  },

  // Accept/Reject handover record
  updateHandoverRecordStatus: async (id, isAccepted) => {
    try {
      console.log('Service: Updating handover record status:', id, isAccepted);
      const response = await axiosInstance.patch(endpoints.handoverRecords.update(id), { isAccepted });
      console.log('Service: Update status response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error updating handover record status:', error);
      throw error;
    }
  },
};

export default handoverRecordService;
