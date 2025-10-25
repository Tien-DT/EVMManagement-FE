// src/features/evm-staff/services/handoverRecordService.js
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const handoverRecordService = {
  // Get all handover records with pagination
  getAllHandoverRecords: async (params = {}) => {
    try {
      console.log('Service: Fetching handover records with params:', params);
      // axiosInstance already returns response.data (ApiResponse wrapper)
      const apiResponse = await axiosInstance.get(endpoints.handoverRecords.getAll, { params });
      console.log('Service: API Response:', apiResponse);
      
      // Extract data from ApiResponse<PagedResult<HandoverRecordResponseDto>>
      return apiResponse.data || apiResponse;
    } catch (error) {
      console.error('Service: Error fetching handover records:', error);
      throw error;
    }
  },

  // Get handover record by ID
  getHandoverRecordById: async (id) => {
    try {
      console.log('Service: Fetching handover record by ID:', id);
      // axiosInstance already returns response.data (ApiResponse wrapper)
      const apiResponse = await axiosInstance.get(endpoints.handoverRecords.getById(id));
      console.log('Service: API Response:', apiResponse);
      
      // Extract data from ApiResponse<HandoverRecordResponseDto>
      return apiResponse.data || apiResponse;
    } catch (error) {
      console.error('Service: Error fetching handover record:', error);
      throw error;
    }
  },

  // Create new handover record
  createHandoverRecord: async (data) => {
    try {
      console.log('Service: Creating handover record with data:', data);
      // axiosInstance already returns response.data (ApiResponse wrapper)
      const apiResponse = await axiosInstance.post(endpoints.handoverRecords.create, data);
      console.log('Service: API Response:', apiResponse);
      
      // Extract data from ApiResponse<HandoverRecordResponseDto>
      return apiResponse.data || apiResponse;
    } catch (error) {
      console.error('Service: Error creating handover record:', error);
      throw error;
    }
  },

  // Update handover record
  updateHandoverRecord: async (id, data) => {
    try {
      console.log('Service: Updating handover record ID:', id, 'with data:', data);
      // axiosInstance already returns response.data (ApiResponse wrapper)
      const apiResponse = await axiosInstance.put(endpoints.handoverRecords.update(id), data);
      console.log('Service: API Response:', apiResponse);
      
      // Extract data from ApiResponse<HandoverRecordResponseDto>
      return apiResponse.data || apiResponse;
    } catch (error) {
      console.error('Service: Error updating handover record:', error);
      throw error;
    }
  },

  // Soft delete handover record (PATCH /is-deleted)
  deleteHandoverRecord: async (id, isDeleted = true) => {
    try {
      console.log('Service: Deleting handover record ID:', id);
      const url = `${endpoints.handoverRecords.delete(id)}/is-deleted?isDeleted=${isDeleted}`;
      
      // axiosInstance already returns response.data (ApiResponse wrapper)
      const apiResponse = await axiosInstance.patch(url);
      console.log('Service: API Response:', apiResponse);
      
      // Extract data from ApiResponse<HandoverRecordResponseDto>
      return apiResponse.data || apiResponse;
    } catch (error) {
      console.error('Service: Error deleting handover record:', error);
      throw error;
    }
  },
};

export default handoverRecordService;
