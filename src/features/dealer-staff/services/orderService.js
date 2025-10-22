// src/features/dealer-staff/services/orderService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const orderService = {
  // Lấy tất cả đơn hàng với phân trang
  getAllOrders: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.orders.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all orders response:", response);
      return response;
    } catch (error) {
      console.error("Get all orders error:", error);
      throw error;
    }
  },

  // Lấy đơn hàng theo dealer ID
  getOrdersByDealer: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.orders.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get orders by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get orders by dealer error:", error);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID
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

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post(
        endpoints.orders.create,
        orderData
      );
      console.log("Create order response:", response);
      return response;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (id, orderData) => {
    try {
      const response = await axiosInstance.put(
        endpoints.orders.update(id),
        orderData
      );
      console.log("Update order response:", response);
      return response;
    } catch (error) {
      console.error("Update order error:", error);
      throw error;
    }
  },

  // Xóa đơn hàng
  deleteOrder: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.orders.delete(id));
      console.log("Delete order response:", response);
      return response;
    } catch (error) {
      console.error("Delete order error:", error);
      throw error;
    }
  },

  // Lấy danh sách báo giá để chọn khi tạo đơn hàng
  getQuotations: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.quotations.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get quotations for order response:", response);
      return response;
    } catch (error) {
      console.error("Get quotations for order error:", error);
      throw error;
    }
  },
};

export default orderService;
