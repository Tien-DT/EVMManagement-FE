// src/features/evm-staff/services/quotationDetailService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const quotationDetailService = {
  // Get all quotation details
  getAllQuotationDetails: async () => {
    try {
      const response = await axiosInstance.get(endpoints.quotationDetails.getAll);
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error("Error fetching quotation details:", error);
      throw error;
    }
  },

  // Get quotation detail by ID
  getQuotationDetailById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.quotationDetails.getById(id));
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error(`Error fetching quotation detail ${id}:`, error);
      throw error;
    }
  },

  // Get quotation details by quotation ID
  getQuotationDetailsByQuotationId: async (quotationId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.quotationDetails.getByQuotationId(quotationId)
      );
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error(`Error fetching quotation details for quotation ${quotationId}:`, error);
      throw error;
    }
  },

  // Create new quotation detail
  createQuotationDetail: async (detailData) => {
    try {
      const response = await axiosInstance.post(
        endpoints.quotationDetails.create,
        detailData
      );
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error("Error creating quotation detail:", error);
      throw error;
    }
  },

  // Update quotation detail
  updateQuotationDetail: async (id, detailData) => {
    try {
      const response = await axiosInstance.put(
        endpoints.quotationDetails.update(id),
        detailData
      );
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error(`Error updating quotation detail ${id}:`, error);
      throw error;
    }
  },

  // Delete quotation detail
  deleteQuotationDetail: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.quotationDetails.delete(id));
      return response; // axiosInstance đã return response.data rồi
    } catch (error) {
      console.error(`Error deleting quotation detail ${id}:`, error);
      throw error;
    }
  },
};

export default quotationDetailService;

