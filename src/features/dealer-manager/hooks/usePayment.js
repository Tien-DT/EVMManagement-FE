// src/features/dealer-manager/hooks/usePayment.js
import { useState } from "react";
import { paymentService } from "../services/paymentService";

/**
 * Hook for processing payments via VNPAY
 */
export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create payment and redirect to VNPAY gateway
   * @param {Object} paymentData
   * @returns {Promise<string>} Payment URL
   */
  const createPayment = async (paymentData) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Creating payment with data:", paymentData);
      const paymentUrl = await paymentService.processPayment(paymentData);
      
      // Redirect to VNPAY payment gateway
      window.location.href = paymentUrl;
      
      return paymentUrl;
    } catch (err) {
      console.error("Error creating payment:", err);
      const errorMessage = err.message || "Không thể tạo thanh toán. Vui lòng thử lại.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle payment callback from VNPAY
   * Should be called when redirected back from VNPAY
   */
  const handlePaymentCallback = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const callbackData = await paymentService.handleVnpayCallback();
      return callbackData;
    } catch (err) {
      console.error("Error handling payment callback:", err);
      const errorMessage = err.message || "Không thể xử lý callback thanh toán.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Create deposit payment
   * @param {Object} data - { orderId, amount, note, isDeposit }
   */
  const payDeposit = async (data) => {
    const paymentData = {
      orderId: data.orderId,
      amount: data.amount,
      orderInfo: data.note || `Deposit for order ${data.orderId}`,
      isDeposit: true,
      bankCode: "",
      locale: "vn",
    };

    return await createPayment(paymentData);
  };

  /**
   * Create full payment (remaining balance)
   * @param {Object} data - { orderId, amount, note }
   */
  const payRemaining = async (data) => {
    const paymentData = {
      orderId: data.orderId,
      amount: data.amount,
      orderInfo: data.note || `Remaining balance for order ${data.orderId}`,
      isDeposit: false,
      bankCode: "",
      locale: "vn",
    };

    return await createPayment(paymentData);
  };

  return {
    isProcessing,
    error,
    createPayment,
    handlePaymentCallback,
    payDeposit,
    payRemaining,
  };
};

export default usePayment;

