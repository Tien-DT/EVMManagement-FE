// src/features/dealer-manager/services/orderService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const orderService = {
  /**
   * GET /api/v1/Orders/{id}
   * Get order by ID
   * @param {string} id - Order UUID
   */
  getOrderById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.orders.getById(id));
      console.log("Get order by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get order by ID error:", error);
      throw error;
    }
  },

  /**
   * GET /api/v1/Orders/{id}/with-details
   * Get order with detailed information including orderDetails
   * @param {string} id - Order UUID
   */
  getOrderWithDetails: async (id) => {
    try {
      console.log("Fetching order with details:", id);
      const response = await axiosInstance.get(endpoints.orders.getWithDetails(id));
      console.log("Order with details response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching order with details:", error);
      throw error;
    }
  },

  /**
   * POST /api/v1/Orders/{orderId}/deposits/preorder
   * Create deposit preorder (Dealer Manager)
   * @param {string} orderId - Order UUID
   * @param {Object} depositData - { method: "CASH" | "TRANSFER", billImageUrl, note }
   */
  createDepositPreorder: async (orderId, depositData) => {
    try {
      console.log("Creating deposit preorder for order:", orderId);
      const response = await axiosInstance.post(
        endpoints.orders.createDepositPreorder(orderId),
        {
          orderId,
          method: depositData.method || "CASH",
          billImageUrl: depositData.billImageUrl || "",
          note: depositData.note || "",
        }
      );
      console.log("Create deposit preorder response:", response);
      return response;
    } catch (error) {
      console.error("Create deposit preorder error:", error);
      throw error;
    }
  },

  /**
   * POST /api/v1/Orders/{orderId}/confirm-payment
   * Confirm payment for order (Dealer Manager - after payment verification)
   * Flow: Pay remaining → Process payment → Paid successfully → Verify payment → Is confirmed? → Confirm payment
   * @param {string} orderId - Order UUID
   * @param {Object} paymentData - { method: "CASH" | "VNPAY", transactionReference, note }
   */
  confirmPayment: async (orderId, paymentData) => {
    try {
      console.log("Confirming payment for order:", orderId);
      const response = await axiosInstance.post(
        endpoints.orders.confirmPayment(orderId),
        {
          method: paymentData.method || "CASH",
          transactionReference: paymentData.transactionReference || "",
          note: paymentData.note || "",
        }
      );
      console.log("Confirm payment response:", response);
      return response;
    } catch (error) {
      console.error("Confirm payment error:", error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/Orders/{orderId}/customer-confirmation
   * Customer confirmation after order inspection (Dealer Manager)
   * Flow: Receive order and conduct inspection → Is correct order?
   * - If Yes: Update confirmation với isCorrect = true
   * - If No: Report to EVM (sử dụng reportService)
   * @param {string} orderId - Order UUID
   * @param {Object} confirmationData - { isCorrect: boolean, notes?, inspectionDate? }
   */
  customerConfirmation: async (orderId, confirmationData) => {
    try {
      console.log("Updating customer confirmation for order:", orderId);
      const response = await axiosInstance.patch(
        endpoints.orders.customerConfirmation(orderId),
        {
          isCorrect: confirmationData.isCorrect,
          notes: confirmationData.notes || "",
          inspectionDate: confirmationData.inspectionDate || new Date().toISOString(),
        }
      );
      console.log("Customer confirmation response:", response);
      return response;
    } catch (error) {
      console.error("Customer confirmation error:", error);
      throw error;
    }
  },
};

export default orderService;

