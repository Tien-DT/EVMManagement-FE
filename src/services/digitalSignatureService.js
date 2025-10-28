// src/services/digitalSignatureService.js
import axiosInstance from "../api/axiosInstance";
import endpoints from "../api/endpoints";

/**
 * Digital Signature Service
 * Xử lý các thao tác liên quan đến chữ ký số điện tử
 */

const digitalSignatureService = {
  /**
   * Yêu cầu mã OTP để ký tài liệu
   * @param {Object} data - Thông tin tài liệu cần ký
   * @param {string} data.documentType - Loại tài liệu: "Contract", "HandoverRecord", "DealerContract"
   * @param {string} data.documentId - ID của tài liệu
   * @param {string} data.signerEmail - Email người ký (nhận OTP)
   * @returns {Promise} Response chứa thông tin OTP đã gửi
   */
  requestOtp: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.digitalSignatures.requestOtp,
        {
          documentType: data.documentType,
          documentId: data.documentId,
          signerEmail: data.signerEmail,
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Request OTP failed:", error);
      throw error;
    }
  },

  /**
   * Xác thực mã OTP
   * @param {Object} data - Thông tin xác thực OTP
   * @param {string} data.documentId - ID của tài liệu
   * @param {string} data.otpCode - Mã OTP nhập vào
   * @param {string} data.documentType - Loại tài liệu
   * @returns {Promise} Response xác thực thành công/thất bại
   */
  verifyOtp: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.digitalSignatures.verifyOtp,
        {
          documentId: data.documentId,
          otpCode: data.otpCode,
          documentType: data.documentType,
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Verify OTP failed:", error);
      throw error;
    }
  },

  /**
   * Hoàn tất chữ ký số sau khi OTP được xác thực
   * @param {Object} data - Thông tin hoàn tất chữ ký
   * @param {string} data.documentId - ID của tài liệu
   * @param {string} data.documentType - Loại tài liệu
   * @param {string} data.signatureData - Dữ liệu chữ ký (nếu có)
   * @returns {Promise} Response chứa thông tin chữ ký đã tạo
   */
  completeSignature: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.digitalSignatures.complete,
        {
          documentId: data.documentId,
          documentType: data.documentType,
          signatureData: data.signatureData || null,
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Complete signature failed:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chữ ký theo ID
   * @param {string} id - ID của chữ ký
   * @returns {Promise} Thông tin chữ ký
   */
  getSignatureById: async (id) => {
    try {
      const response = await axiosInstance.get(
        endpoints.digitalSignatures.getById(id)
      );
      return response;
    } catch (error) {
      console.error("❌ Get signature by ID failed:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chữ ký theo Contract ID
   * @param {string} contractId - ID của hợp đồng
   * @returns {Promise} Danh sách chữ ký
   */
  getSignaturesByContract: async (contractId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.digitalSignatures.getByContract(contractId)
      );
      return response;
    } catch (error) {
      console.error("❌ Get signatures by contract failed:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chữ ký theo Handover Record ID
   * @param {string} recordId - ID của biên bản bàn giao
   * @returns {Promise} Danh sách chữ ký
   */
  getSignaturesByHandoverRecord: async (recordId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.digitalSignatures.getByHandoverRecord(recordId)
      );
      return response;
    } catch (error) {
      console.error("❌ Get signatures by handover record failed:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chữ ký theo Dealer Contract ID
   * @param {string} dealerContractId - ID của hợp đồng dealer
   * @returns {Promise} Danh sách chữ ký
   */
  getSignaturesByDealerContract: async (dealerContractId) => {
    try {
      const response = await axiosInstance.get(
        endpoints.digitalSignatures.getByDealerContract(dealerContractId)
      );
      return response;
    } catch (error) {
      console.error("❌ Get signatures by dealer contract failed:", error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái chữ ký của tài liệu
   * @param {string} documentType - Loại tài liệu
   * @param {string} documentId - ID của tài liệu
   * @returns {Promise} Thông tin trạng thái chữ ký
   */
  checkSignatureStatus: async (documentType, documentId) => {
    try {
      let response;
      switch (documentType) {
        case "Contract":
          response = await digitalSignatureService.getSignaturesByContract(
            documentId
          );
          break;
        case "HandoverRecord":
          response =
            await digitalSignatureService.getSignaturesByHandoverRecord(
              documentId
            );
          break;
        case "DealerContract":
          response =
            await digitalSignatureService.getSignaturesByDealerContract(
              documentId
            );
          break;
        default:
          throw new Error(`Unknown document type: ${documentType}`);
      }
      return response;
    } catch (error) {
      console.error("❌ Check signature status failed:", error);
      throw error;
    }
  },
};

export default digitalSignatureService;

