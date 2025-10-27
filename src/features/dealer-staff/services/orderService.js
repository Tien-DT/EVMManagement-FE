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
      console.log("🔍 Validating order data before sending...");
      
      // Validate required fields
      const requiredFields = ['code', 'customerId', 'dealerId', 'createdByUserId', 'status', 
                              'totalAmount', 'finalAmount', 'expectedDeliveryAt', 'orderType'];
      
      for (const field of requiredFields) {
        if (!orderData[field] && orderData[field] !== 0 && orderData[field] !== false) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      console.log("✅ All required fields present");
      console.log("📤 Sending POST request to:", endpoints.orders.create);
      console.log("📦 Request body:", JSON.stringify(orderData, null, 2));
      
      const response = await axiosInstance.post(
        endpoints.orders.create,
        orderData
      );
      
      console.log("✅ Create order response:", response);
      return response;
    } catch (error) {
      console.error("❌ Create order error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
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

  // Create order detail
  createOrderDetail: async (orderDetailData) => {
    try {
      const response = await axiosInstance.post(
        "/v1/OrderDetails",
        orderDetailData
      );
      console.log("Create order detail response:", response);
      return response;
    } catch (error) {
      console.error("Create order detail error:", error);
      throw error;
    }
  },

  // Create order with order details (for cart workflow)
  createOrderWithDetails: async (orderData, orderDetails) => {
    try {
      // Validate order data
      if (!orderData.customerId || !orderData.dealerId || !orderData.createdByUserId) {
        throw new Error("Missing required fields: customerId, dealerId, or createdByUserId");
      }

      // Step 1: Create order
      console.log("Step 1: Creating order with data:", orderData);
      const orderResponse = await axiosInstance.post(
        endpoints.orders.create,
        orderData
      );
      console.log("Order created response:", orderResponse);

      // Check if order was created successfully
      if (!orderResponse || (!orderResponse.success && !orderResponse.data)) {
        const errorMsg = orderResponse?.message || "Failed to create order";
        throw new Error(errorMsg);
      }

      // Get orderId from response
      const orderId = orderResponse.data?.id || orderResponse.id;
      
      if (!orderId) {
        console.error("Order response structure:", orderResponse);
        throw new Error("Order created but missing order ID in response");
      }

      console.log("Order ID:", orderId);

      // Step 2: Create order details with the order ID
      console.log("Step 2: Creating order details...");
      const orderDetailPromises = orderDetails.map((detail) => {
        // Validate detail data
        if (!detail.vehicleVariantId || !detail.vehicleId) {
          throw new Error("Missing vehicleVariantId or vehicleId in order detail");
        }

        const orderDetailData = {
          orderId: orderId,
          vehicleVariantId: detail.vehicleVariantId,
          vehicleId: detail.vehicleId,
          quantity: detail.quantity || 1,
          unitPrice: detail.unitPrice || 0,
          discountPercent: detail.discountPercent || 0,
          note: detail.note || "",
        };
        console.log("Creating order detail:", orderDetailData);
        return axiosInstance.post("/v1/OrderDetails", orderDetailData);
      });

      const orderDetailsResponses = await Promise.all(orderDetailPromises);
      console.log("Order details created:", orderDetailsResponses);

      return {
        success: true,
        data: {
          order: orderResponse.data || orderResponse,
          orderDetails: orderDetailsResponses.map((r) => r.data || r),
        },
        message: "Tạo đơn hàng thành công",
      };
    } catch (error) {
      console.error("❌ Create order with details error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      
      // Re-throw with more informative message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Lỗi khi tạo đơn hàng";
      throw new Error(errorMessage);
    }
  },
};

export default orderService;
