// src/features/evm-staff/services/reportService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const reportService = {
  /**
   * GET /v1/Reports
   * Get all reports with pagination and filters
   * EVM Staff receives reports from Dealer Managers
   * @param {Object} params - { dealerId, accountId, pageNumber, pageSize }
   */
  getAllReports: async (params = {}) => {
    try {
      const { dealerId, accountId, pageNumber = 1, pageSize = 10 } = params;
      
      console.log("EVM Staff: Fetching reports with params:", params);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          ...(dealerId && { dealerId }),
          ...(accountId && { accountId }),
          pageNumber,
          pageSize,
        },
      });
      console.log("EVM Staff: Get all reports response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Get all reports error:", error);
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
      console.log("EVM Staff: Fetching report by ID:", id);
      const response = await axiosInstance.get(endpoints.reports.getById(id));
      console.log("EVM Staff: Get report by ID response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Get report by ID error:", error);
      throw error;
    }
  },

  /**
   * PATCH /v1/Reports/{id}
   * Update report status
   * EVM Staff reviews and approves/rejects reports
   * @param {string} id - Report UUID
   * @param {Object} partialData - { status, notes, reviewedBy, etc }
   */
  updateReportStatus: async (id, status, notes = null) => {
    try {
      const updateData = { status };
      if (notes) {
        updateData.notes = notes;
      }
      
      console.log("EVM Staff: Updating report status:", id, status);
      const response = await axiosInstance.patch(
        endpoints.reports.update(id),
        updateData
      );
      console.log("EVM Staff: Update report status response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Update report status error:", error);
      throw error;
    }
  },

  /**
   * Approve report
   * @param {string} id - Report UUID
   * @param {string} notes - Optional approval notes
   */
  approveReport: async (id, notes = null) => {
    return await reportService.updateReportStatus(id, "APPROVED", notes);
  },

  /**
   * Reject report
   * @param {string} id - Report UUID
   * @param {string} notes - Rejection reason
   */
  rejectReport: async (id, notes = null) => {
    return await reportService.updateReportStatus(id, "REJECTED", notes);
  },

  /**
   * Get reports by dealer ID
   * See all reports from a specific dealer
   * @param {string} dealerId - Dealer UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getReportsByDealer: async (dealerId, params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("EVM Staff: Fetching reports for dealer:", dealerId);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          dealerId,
          pageNumber,
          pageSize,
        },
      });
      console.log("EVM Staff: Get reports by dealer response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Get reports by dealer error:", error);
      throw error;
    }
  },

  /**
   * Get reports by order ID
   * See all reports for a specific order
   * @param {string} orderId - Order UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getReportsByOrder: async (orderId, params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("EVM Staff: Fetching reports for order:", orderId);
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          orderId,
          pageNumber,
          pageSize,
        },
      });
      console.log("EVM Staff: Get reports by order response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Get reports by order error:", error);
      throw error;
    }
  },

  /**
   * Get pending reports
   * Reports waiting for review by EVM Staff
   */
  getPendingReports: async (params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("EVM Staff: Fetching pending reports");
      const response = await axiosInstance.get(endpoints.reports.getAll, {
        params: {
          status: "PENDING",
          pageNumber,
          pageSize,
        },
      });
      console.log("EVM Staff: Get pending reports response:", response);
      return response;
    } catch (error) {
      console.error("EVM Staff: Get pending reports error:", error);
      throw error;
    }
  },
};

export default reportService;

