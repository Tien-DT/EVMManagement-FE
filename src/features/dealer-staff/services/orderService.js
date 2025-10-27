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
  getOrdersByDealer: async (
    dealerId,
    pageNumber = 1,
    pageSize = 10,
    filters = {}
  ) => {
    try {
      const params = {
        dealerId,
        pageNumber,
        pageSize,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(endpoints.orders.filter, {
        params,
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
  createPreOrder: async (preOrderData) => {
    try {
      // Step 1: Create order with details
      const orderPayload = {
        code: `PRE-${Date.now()}`,
        customerId: preOrderData.customerId,
        dealerId: preOrderData.dealerId,
        createdByUserId: preOrderData.createdByUserId,
        status: 1, // AWAITING_DEPOSIT
        orderType: 2, // B2C_P - Pre-order from customer
        isFinanced: false,
        note: preOrderData.note || "",
        orderDetails: [
          {
            vehicleVariantId: preOrderData.variantId, // FIX: Must be vehicleVariantId, not variantId
            vehicleId: null, // No specific vehicle yet for pre-order
            quantity: 1,
            unitPrice: preOrderData.price,
            discountPercent: 0,
            note: "Pre-order item"
          }
        ]
      };

      const orderResponse = await axiosInstance.post(
        "/v1/Orders/with-details",
        orderPayload
      );

      // Response structure from axiosInstance interceptor:
      // Already unwrapped to: { success: true, data: {...}, message: '', errors: [] }
      if (!orderResponse || !orderResponse.data) {
        throw new Error("Failed to create order - Invalid response structure");
      }

      const orderId = orderResponse.data.id;

      // Step 2: Create deposit for the order
      const depositNote = preOrderData.depositNote || "Pre-order deposit (10%)";

      const depositPayload = {
        method: preOrderData.depositMethod || 0, // CASH
        note: depositNote,
      };

      const depositResponse = await axiosInstance.post(
        `/v1/Orders/${orderId}/deposits/preorder`,
        depositPayload
      );

      if (!depositResponse || !depositResponse.data) {
        throw new Error("Failed to create deposit - Invalid response structure");
      }

      return {
        success: true,
        order: orderResponse.data,
        deposit: depositResponse.data,
      };
    } catch (error) {
      console.error("Create pre-order error:", error);
      throw error;
    }
  },

  createRemainingPayment: async (orderId, paymentData) => {
    try {
      const response = await axiosInstance.post(
        `/v1/Orders/${orderId}/confirm-payment`,
        paymentData
      );
      console.log("Remaining payment created:", response);
      return response;
    } catch (error) {
      console.error("Create remaining payment error:", error);
      throw error;
    }
  },
};

export default orderService;
