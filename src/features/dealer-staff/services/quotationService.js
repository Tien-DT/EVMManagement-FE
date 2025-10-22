// src/features/evm-staff/services/quotationService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const quotationService = {
  // Get all quotations with pagination
  getAllQuotations: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.quotations.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all quotations response:", response);
      return response;
    } catch (error) {
      console.error("Get all quotations error:", error);
      throw error;
    }
  },

  // Get quotation by ID
  getQuotationById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.quotations.getById(id));
      console.log("Get quotation by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get quotation by ID error:", error);
      throw error;
    }
  },

  // Get quotations by dealer ID
  getQuotationsByDealerId: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        endpoints.quotations.getByDealerId(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get quotations by dealer ID response:", response);
      return response;
    } catch (error) {
      console.error("Get quotations by dealer ID error:", error);
      throw error;
    }
  },

  // Create new quotation
  createQuotation: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.quotations.create,
        data
      );
      console.log("Create quotation response:", response);
      return response;
    } catch (error) {
      console.error("Create quotation error:", error);
      throw error;
    }
  },

  // Update quotation
  updateQuotation: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        endpoints.quotations.update(id),
        data
      );
      console.log("Update quotation response:", response);
      return response;
    } catch (error) {
      console.error("Update quotation error:", error);
      throw error;
    }
  },

  // Delete quotation
  deleteQuotation: async (id) => {
    try {
      const response = await axiosInstance.delete(
        endpoints.quotations.delete(id)
      );
      console.log("Delete quotation response:", response);
      return response;
    } catch (error) {
      console.error("Delete quotation error:", error);
      throw error;
    }
  },
};