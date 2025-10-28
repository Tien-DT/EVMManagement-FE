// src/features/evm-staff/hooks/useDigitalSignature.js
import { useState, useCallback } from "react";
import digitalSignatureService from "../../../services/digitalSignatureService";

/**
 * Hook quản lý Digital Signature cho EVM Staff
 * Xử lý flow: Request OTP → Verify OTP → Complete Signature
 */
const useDigitalSignature = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState("idle"); // idle, otp_requested, otp_verified, completed
  const [signatures, setSignatures] = useState([]);

  /**
   * Reset tất cả states về trạng thái ban đầu
   */
  const reset = useCallback(() => {
    setOtpRequested(false);
    setOtpVerified(false);
    setSignatureCompleted(false);
    setCurrentStep("idle");
    setError(null);
  }, []);

  /**
   * Bước 1: Yêu cầu OTP
   */
  const requestOtp = useCallback(async (documentType, documentId, signerEmail) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await digitalSignatureService.requestOtp({
        documentType,
        documentId,
        signerEmail,
      });

      setOtpRequested(true);
      setCurrentStep("otp_requested");
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || "Không thể gửi mã OTP. Vui lòng thử lại.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Bước 2: Xác thực OTP
   */
  const verifyOtp = useCallback(async (documentId, otpCode, documentType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await digitalSignatureService.verifyOtp({
        documentId,
        otpCode,
        documentType,
      });

      setOtpVerified(true);
      setCurrentStep("otp_verified");
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Bước 3: Hoàn tất chữ ký
   */
  const completeSignature = useCallback(async (documentId, documentType, signatureData = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await digitalSignatureService.completeSignature({
        documentId,
        documentType,
        signatureData,
      });

      setSignatureCompleted(true);
      setCurrentStep("completed");
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || "Không thể hoàn tất chữ ký. Vui lòng thử lại.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Lấy danh sách chữ ký theo loại tài liệu
   */
  const fetchSignatures = useCallback(async (documentType, documentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await digitalSignatureService.checkSignatureStatus(
        documentType,
        documentId
      );
      setSignatures(Array.isArray(response) ? response : [response]);
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || "Không thể tải thông tin chữ ký.";
      setError(errorMessage);
      setSignatures([]);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Kiểm tra xem tài liệu đã được ký chưa
   */
  const checkIfSigned = useCallback(async (documentType, documentId) => {
    const result = await fetchSignatures(documentType, documentId);
    if (result.success && result.data) {
      const signatureList = Array.isArray(result.data) ? result.data : [result.data];
      return signatureList.length > 0;
    }
    return false;
  }, [fetchSignatures]);

  return {
    // States
    isLoading,
    error,
    otpRequested,
    otpVerified,
    signatureCompleted,
    currentStep,
    signatures,

    // Actions
    requestOtp,
    verifyOtp,
    completeSignature,
    fetchSignatures,
    checkIfSigned,
    reset,
  };
};

export default useDigitalSignature;

