// src/features/evm-staff/services/orderService.js
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const orderService = {
  /**
   * GET /api/v1/Orders
   * Get all orders with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  getAllOrders: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        ...filters
      } = params;

      const queryParams = {
        pageNumber,
        pageSize,
        ...filters,
      };

      const hasFilters = Object.keys(filters).length > 0;
      const endpoint = hasFilters ? endpoints.orders.filter : endpoints.orders.getAll;

      console.log('Service: Fetching orders with params:', queryParams);
      const response = await axiosInstance.get(endpoint, {
        params: queryParams,
      });
      console.log('Service: Orders response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/Orders/{id}
   * Get order by ID
   * @param {string} id - Order UUID
   */
  getOrderById: async (id) => {
    try {
      console.log('Service: Fetching order by ID:', id);
      const response = await axiosInstance.get(endpoints.orders.getById(id));
      console.log('Service: Order response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching order by ID:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/Orders/{id}/with-details
   * Get order by ID with details (orderDetails, vehicle info, etc.)
   * @param {string} id - Order UUID
   */
  getOrderByIdWithDetails: async (id) => {
    try {
      console.log('Service: Fetching order with details by ID:', id);
      const response = await axiosInstance.get(`${endpoints.orders.getById(id)}/with-details`);
      console.log('Service: Order with details response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching order with details:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/Orders
   * Create new order
   * @param {Object} orderData - Order data
   * {
   *   code: string,
   *   quotationId: uuid,
   *   customerId: uuid,
   *   dealerId: uuid,
   *   status: "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELED",
   *   totalAmount: number,
   *   discountAmount: number,
   *   finalAmount: number,
   *   expectedDeliveryAt: datetime,
   *   orderType: "B2B" | "B2C",
   *   isFinanced: boolean
   * }
   */
  createOrder: async (orderData) => {
    try {
      console.log('Service: Creating order with data:', orderData);
      const response = await axiosInstance.post(endpoints.orders.create, orderData);
      console.log('Service: Order created:', response);
      return response;
    } catch (error) {
      console.error('Service: Error creating order:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/Orders/{id}
   * Update order (full update)
   * @param {string} id - Order UUID
   * @param {Object} orderData - Full order data
   */
  updateOrder: async (id, orderData) => {
    try {
      console.log('Service: Updating order:', id, orderData);
      const response = await axiosInstance.put(endpoints.orders.update(id), orderData);
      console.log('Service: Order updated:', response);
      return response;
    } catch (error) {
      console.error('Service: Error updating order:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/Orders/{id}
   * Partially update order
   * @param {string} id - Order UUID
   * @param {Object} partialData - Partial order data
   */
  patchOrder: async (id, partialData) => {
    try {
      console.log('Service: Patching order:', id, partialData);
      const response = await axiosInstance.patch(endpoints.orders.update(id), partialData);
      console.log('Service: Order patched:', response);
      return response;
    } catch (error) {
      console.error('Service: Error patching order:', error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/Orders/{id}
   * Delete order
   * @param {string} id - Order UUID
   */
  deleteOrder: async (id) => {
    try {
      console.log('Service: Deleting order:', id);
      const response = await axiosInstance.delete(endpoints.orders.delete(id));
      console.log('Service: Order deleted:', response);
      return response;
    } catch (error) {
      console.error('Service: Error deleting order:', error);
      throw error;
    }
  },

  /**
   * Update order status
   * @param {string} id - Order UUID
   * @param {string} status - CONFIRMED | PROCESSING | COMPLETED | CANCELED
   */
  updateOrderStatus: async (id, status) => {
    try {
      console.log('Service: Updating order status:', id, status);
      const response = await axiosInstance.patch(endpoints.orders.update(id), { status });
      console.log('Service: Order status updated:', response);
      return response;
    } catch (error) {
      console.error('Service: Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Generate order code from UUID (for display purposes)
   * @param {string} uuid - Order UUID
   * @returns {string} Order code (ORD-XXXXXXXX)
   */
  generateOrderCode: (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `ORD-${shortId}`;
  }
};

export default orderService;

