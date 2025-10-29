// src/features/dealer-manager/services/reportService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const reportService = {
  /**
   * GET /v1/Reports
   * Get all reports with pagination and filters
   * @param {Object} params - { dealerId, accountId, pageNumber, pageSize }
   */
  getAllReports: async (params = {}) => {
    try {
      const { dealerId, accountId, pageNumber = 1, pageSize = 10 } = params;
      
      console.log("Fetching reports with params:", params);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          ...(dealerId && { dealerId }),
          ...(accountId && { accountId }),
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all reports response:", response);
      return response;
    } catch (error) {
      console.error("Get all reports error:", error);
      throw error;
    }
  },

  /**
   * GET /v1/Reports/{id}
   * Get report by ID
   * @param {string} id - Report UUID
   */
  getReportById: async (id) => {
    try {
      console.log("Fetching report by ID:", id);
      const response = await axiosInstance.get(endpoints.reports.getById(id));
      console.log("Get report by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get report by ID error:", error);
      throw error;
    }
  },

  /**
   * POST /v1/Reports
   * Create new report (Dealer Manager reports issue to EVM)
   * @param {Object} reportData - { accountId, dealerId, type, title, content, orderId, transportId }
   */
  createReport: async (reportData) => {
    try {
      console.log("Creating report with data:", reportData);
      const response = await axiosInstance.post(
        endpoints.reports.create,
        reportData
      );
      console.log("Create report response:", response);
      return response;
    } catch (error) {
      console.error("Create report error:", error);
      throw error;
    }
  },

  /**
   * PATCH /v1/Reports/{id}
   * Update report
   * @param {string} id - Report UUID
   * @param {Object} partialData - Partial report data
   */
  updateReport: async (id, partialData) => {
    try {
      console.log("Updating report ID:", id, "with data:", partialData);
      const response = await axiosInstance.patch(
        endpoints.reports.update(id),
        partialData
      );
      console.log("Update report response:", response);
      return response;
    } catch (error) {
      console.error("Update report error:", error);
      throw error;
    }
  },

  /**
   * DELETE /v1/Reports/{id}
   * Delete report
   * @param {string} id - Report UUID
   */
  deleteReport: async (id) => {
    try {
      console.log("Deleting report ID:", id);
      const response = await axiosInstance.delete(
        endpoints.reports.delete(id)
      );
      console.log("Delete report response:", response);
      return response;
    } catch (error) {
      console.error("Delete report error:", error);
      throw error;
    }
  },

  /**
   * GET /v1/Reports by dealerId
   * Get all reports for a specific dealer
   * @param {string} dealerId - Dealer UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getReportsByDealer: async (dealerId, params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("Fetching reports for dealer:", dealerId);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          dealerId,
          pageNumber,
          pageSize,
        },
      });
      console.log("Get reports by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get reports by dealer error:", error);
      throw error;
    }
  },

  /**
   * GET /v1/Reports by orderId
   * Get all reports for a specific order
   * @param {string} orderId - Order UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getReportsByOrder: async (orderId, params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("Fetching reports for order:", orderId);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          orderId,
          pageNumber,
          pageSize,
        },
      });
      console.log("Get reports by order response:", response);
      return response;
    } catch (error) {
      console.error("Get reports by order error:", error);
      throw error;
    }
  },

  /**
   * Report order issue to EVM
   * Convenience method for creating a report when order is incorrect
   * @param {Object} data - { orderId, title, content, accountId, dealerId, transportId?, type? }
   */
  reportOrderIssue: async (data) => {
    try {
      const reportData = {
        accountId: data.accountId,
        dealerId: data.dealerId,
        orderId: data.orderId,
        type: data.type || "ORDER_ISSUE",
        title: data.title || "Order Issue Report",
        content: data.content,
        ...(data.transportId && { transportId: data.transportId }),
      };
      
      console.log("Reporting order issue to EVM:", reportData);
      const response = await axiosInstance.post(
        endpoints.reports.create,
        reportData
      );
      console.log("Report order issue response:", response);
      return response;
    } catch (error) {
      console.error("Report order issue error:", error);
      throw error;
    }
  },
};

export default reportService;

