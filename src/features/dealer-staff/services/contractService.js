// src/features/dealer-staff/services/contractService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const contractService = {
  // Lấy tất cả contracts với phân trang
  getAllContracts: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.contracts.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all contracts response:", response);
      return response;
    } catch (error) {
      console.error("Get all contracts error:", error);
      throw error;
    }
  },

  // Lấy contract theo ID
  getContractById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.contracts.getById(id));
      console.log("Get contract by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get contract by ID error:", error);
      throw error;
    }
  },

  // Tạo contract mới
  createContract: async (contractData) => {
    try {
      const response = await axiosInstance.post(
        endpoints.contracts.create,
        contractData
      );
      console.log("Create contract response:", response);
      return response;
    } catch (error) {
      console.error("Create contract error:", error);
      throw error;
    }
  },

  // Cập nhật contract
  updateContract: async (id, contractData) => {
    try {
      const response = await axiosInstance.put(
        endpoints.contracts.update(id),
        contractData
      );
      console.log("Update contract response:", response);
      return response;
    } catch (error) {
      console.error("Update contract error:", error);
      throw error;
    }
  },

  // Xóa contract
  deleteContract: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.contracts.delete(id));
      console.log("Delete contract response:", response);
      return response;
    } catch (error) {
      console.error("Delete contract error:", error);
      throw error;
    }
  },
};

export default contractService;