// src/features/dealer-manager/services/paymentService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const paymentService = {
  /**
   * POST /v1/Payments/vnpay/create
   * Create VNPAY payment URL
   * @param {Object} paymentData
   * {
   *   orderId: uuid,
   *   amount: number,
   *   orderInfo: string,
   *   isDeposit: boolean,
   *   bankCode?: string,
   *   locale?: string
   * }
   */
  createVnpayPayment: async (paymentData) => {
    try {
      console.log("Creating VNPAY payment with data:", paymentData);
      const response = await axiosInstance.post(
        endpoints.payments.vnpayCreate,
        paymentData
      );
      console.log("VNPAY payment created:", response);
      return response;
    } catch (error) {
      console.error("Error creating VNPAY payment:", error);
      throw error;
    }
  },

  /**
   * Process VNPAY callback
   * This will be handled by the backend automatically
   * @returns {Object} Callback data
   */
  handleVnpayCallback: async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackData = {
        vnp_TxnRef: urlParams.get("vnp_TxnRef"),
        vnp_Amount: urlParams.get("vnp_Amount"),
        vnp_SecureHash: urlParams.get("vnp_SecureHash"),
        vnp_ResponseCode: urlParams.get("vnp_ResponseCode"),
        vnp_TransactionStatus: urlParams.get("vnp_TransactionStatus"),
      };

      console.log("VNPAY callback data:", callbackData);
      
      // Send to backend for verification
      const response = await axiosInstance.get(
        endpoints.payments.vnpayCallback,
        { params: callbackData }
      );
      
      console.log("VNPAY callback processed:", response);
      return response;
    } catch (error) {
      console.error("Error processing VNPAY callback:", error);
      throw error;
    }
  },

  /**
   * Handle VNPAY return URL
   * GET /v1/Payments/vnpay/return
   * @param {Object} returnData - URL parameters from VNPAY redirect
   */
  handleVnpayReturn: async (returnData) => {
    try {
      console.log("Processing VNPAY return with data:", returnData);
      const response = await axiosInstance.get(
        endpoints.payments.vnpayReturn,
        { params: returnData }
      );
      console.log("VNPAY return processed:", response);
      return response;
    } catch (error) {
      console.error("Error processing VNPAY return:", error);
      throw error;
    }
  },

  /**
   * Create payment and redirect to VNPAY gateway
   * @param {Object} paymentData
   * @returns {Promise<string>} Payment URL to redirect
   */
  processPayment: async (paymentData) => {
    try {
      const response = await paymentService.createVnpayPayment(paymentData);
      
      // Extract payment URL from response
      const paymentUrl = response?.data?.paymentUrl || response?.paymentUrl;
      
      if (!paymentUrl) {
        throw new Error("No payment URL received from server");
      }

      console.log("Redirecting to VNPAY:", paymentUrl);
      return paymentUrl;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },
};

export default paymentService;

