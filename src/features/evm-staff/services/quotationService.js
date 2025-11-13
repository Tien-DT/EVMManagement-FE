// src/features/evm-staff/services/quotationService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const quotationService = {
  // Get all quotations with optional params
  getAllQuotations: async (params = {}) => {
    try {
      console.log('Service: Fetching quotations with params:', params);
      const response = await axiosInstance.get(endpoints.quotations.getAll, { params });
      console.log('Service: Quotations response:', response);
      // axiosInstance returns response.data which is { success, data: { items }, errors }
      // We return the whole response so hook can access response.data.items
      return response;
    } catch (error) {
      console.error('Service: Error fetching quotations:', error);
      throw error;
    }
  },

  // Get quotation by ID
  getQuotationById: async (id) => {
    try {
      console.log('Service: Fetching quotation by ID:', id);
      const response = await axiosInstance.get(endpoints.quotations.getById(id));
      console.log('Service: Quotation by ID response:', response);
      // axiosInstance already returns response.data, so just return response
      return response;
    } catch (error) {
      console.error('Service: Error fetching quotation by ID:', error);
      throw error;
    }
  },

  // Get quotations by dealer ID
  getQuotationsByDealerId: async (dealerId, params = {}) => {
    try {
      console.log('Service: Fetching quotations by dealer ID:', dealerId, 'with params:', params);
      const response = await axiosInstance.get(
        endpoints.quotations.getByDealerId(dealerId),
        { params }
      );
      console.log('Service: Quotations by dealer response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching quotations by dealer:', error);
      throw error;
    }
  },

  // Create new quotation (with quotationDetails)
  createQuotation: async (data) => {
    try {
      console.log('Service: Sending POST request to create quotation');
      console.log('Service: Quotation data:', data);
      const response = await axiosInstance.post(endpoints.quotations.create, data);
      console.log('Service: Create quotation response:', response);
      // Return whole response for consistency
      return response;
    } catch (error) {
      console.error('Service: Error creating quotation:', error);
      console.error('Service: Error response:', error.response);
      throw error;
    }
  },

  // Update quotation
  updateQuotation: async (id, data) => {
    try {
      console.log('Service: Updating quotation ID:', id);
      console.log('Service: Update data:', data);
      const response = await axiosInstance.put(endpoints.quotations.update(id), data);
      console.log('Service: Update quotation response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error updating quotation:', error);
      throw error;
    }
  },

  // Delete quotation
  deleteQuotation: async (id) => {
    try {
      console.log('Service: Deleting quotation ID:', id);
      const response = await axiosInstance.delete(endpoints.quotations.delete(id));
      console.log('Service: Delete quotation response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error deleting quotation:', error);
      throw error;
    }
  },

  // Update quotation status
  updateQuotationStatus: async (id, status) => {
    try {
      console.log('Service: Updating quotation status:', id, status);
      const response = await axiosInstance.patch(`/v1/Quotations/${id}/status`, { status });
      console.log('Service: Update status response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error updating quotation status:', error);
      throw error;
    }
  },

  // Get specific quotation by ID
  getSpecificQuotation: async (quotationId) => {
    try {
      console.log('Service: Getting specific quotation:', quotationId);
      const response = await axiosInstance.get(endpoints.quotations.getById(quotationId));
      console.log('Service: Specific quotation response:', response);
      return response.data;
    } catch (error) {
      console.error('Service: Error getting specific quotation:', error);
      throw error;
    }
  },
};

export default quotationService;

