// src/features/dealer-manager/services/depositService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const depositService = {
  /**
   * GET /v1/Deposits
   * Get all deposits with pagination and filters
   * @param {Object} params - { orderId, receivedByUserId, pageNumber, pageSize }
   */
  getAllDeposits: async (params = {}) => {
    try {
      const { 
        orderId, 
        receivedByUserId, 
        pageNumber = 1, 
        pageSize = 10 
      } = params;
      
      console.log("Fetching deposits with params:", params);
      const response = await axiosInstance.get(endpoints.deposits.getAll, {
        params: {
          ...(orderId && { orderId }),
          ...(receivedByUserId && { receivedByUserId }),
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all deposits response:", response);
      return response;
    } catch (error) {
      console.error("Get all deposits error:", error);
      throw error;
    }
  },

  /**
   * GET /v1/Deposits/{id}
   * Get deposit by ID
   * @param {string} id - Deposit UUID
   */
  getDepositById: async (id) => {
    try {
      console.log("Fetching deposit by ID:", id);
      const response = await axiosInstance.get(endpoints.deposits.getById(id));
      console.log("Get deposit by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get deposit by ID error:", error);
      throw error;
    }
  },

  /**
   * POST /v1/Deposits
   * Create new deposit (Dealer Manager creates deposit for their orders)
   * @param {Object} depositData - { orderId, amount, method, status, receivedByUserId, note }
   */
  createDeposit: async (depositData) => {
    try {
      console.log("Creating deposit with data:", depositData);
      const response = await axiosInstance.post(
        endpoints.deposits.create,
        depositData
      );
      console.log("Create deposit response:", response);
      return response;
    } catch (error) {
      console.error("Create deposit error:", error);
      throw error;
    }
  },

  /**
   * PATCH /v1/Deposits/{id}
   * Update deposit status (e.g., from PENDING to CONFIRMED)
   * @param {string} id - Deposit UUID
   * @param {Object} partialData - Partial deposit data
   */
  updateDeposit: async (id, partialData) => {
    try {
      console.log("Updating deposit ID:", id, "with data:", partialData);
      const response = await axiosInstance.patch(
        endpoints.deposits.update(id),
        partialData
      );
      console.log("Update deposit response:", response);
      return response;
    } catch (error) {
      console.error("Update deposit error:", error);
      throw error;
    }
  },

  /**
   * DELETE /v1/Deposits/{id}
   * Delete deposit
   * @param {string} id - Deposit UUID
   */
  deleteDeposit: async (id) => {
    try {
      console.log("Deleting deposit ID:", id);
      const response = await axiosInstance.delete(
        endpoints.deposits.delete(id)
      );
      console.log("Delete deposit response:", response);
      return response;
    } catch (error) {
      console.error("Delete deposit error:", error);
      throw error;
    }
  },

  /**
   * GET /v1/Deposits by orderId
   * Get all deposits for a specific order
   * @param {string} orderId - Order UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getDepositsByOrder: async (orderId, params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10 } = params;
      console.log("Fetching deposits for order:", orderId);
      const response = await axiosInstance.get(endpoints.deposits.getAll, {
        params: {
          orderId,
          pageNumber,
          pageSize,
        },
      });
      console.log("Get deposits by order response:", response);
      return response;
    } catch (error) {
      console.error("Get deposits by order error:", error);
      throw error;
    }
  },

  /**
   * Verify deposit payment
   * Update deposit status to VERIFIED/CONFIRMED
   * @param {string} id - Deposit UUID
   * @param {string} status - New status (CONFIRMED, REJECTED)
   */
  verifyDeposit: async (id, status = "CONFIRMED") => {
    try {
      console.log("Verifying deposit ID:", id, "with status:", status);
      const response = await axiosInstance.patch(
        endpoints.deposits.update(id),
        { status }
      );
      console.log("Verify deposit response:", response);
      return response;
    } catch (error) {
      console.error("Verify deposit error:", error);
      throw error;
    }
  },
};

export default depositService;

