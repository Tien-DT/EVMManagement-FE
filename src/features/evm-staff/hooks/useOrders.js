// src/features/evm-staff/hooks/useOrders.js
import { useState, useEffect } from 'react';
import orderService from '../services/orderService';

const useOrders = (autoFetch = true) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  /**
   * Fetch all orders with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const requestParams = {
        ...params,
      };

      if (requestParams.status === undefined) {
        requestParams.status = 0;
      }

      if (requestParams.orderType === undefined) {
        requestParams.orderType = 1;
      }

      const response = await orderService.getAllOrders(requestParams);
      console.log('Hook: Orders response:', response);
      
      // Response structure: { success, data: { items, pageNumber, pageSize, totalCount, totalPages }, errors }
      const ordersData = response.data || response;
      
      setOrders(ordersData.items || []);
      setPagination({
        pageNumber: ordersData.pageNumber || 1,
        pageSize: ordersData.pageSize || 10,
        totalCount: ordersData.totalCount || 0,
        totalPages: ordersData.totalPages || 0,
        hasNextPage: ordersData.hasNextPage || false,
        hasPreviousPage: ordersData.hasPreviousPage || false
      });
      return response;
    } catch (err) {
      console.error('Hook: Error fetching orders:', err);
      setError(err.message || 'Error fetching orders');
      setOrders([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get order by ID
   * @param {string} id - Order UUID
   */
  const getOrderById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(id);
      console.log('Hook: Order by ID response:', response);
      return response;
    } catch (err) {
      console.error('Hook: Error fetching order by ID:', err);
      setError(err.message || 'Error fetching order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new order
   * @param {Object} orderData - Order data
   */
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating order with data:', orderData);
      const response = await orderService.createOrder(orderData);
      console.log('Hook: Order created successfully:', response);
      // Refresh orders list
      await fetchOrders();
      return response;
    } catch (err) {
      console.error('Hook: Error creating order:', err);
      setError(err.message || 'Error creating order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update order (full update)
   * @param {string} id - Order UUID
   * @param {Object} orderData - Full order data
   */
  const updateOrder = async (id, orderData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Updating order:', id, orderData);
      const response = await orderService.updateOrder(id, orderData);
      console.log('Hook: Order updated successfully:', response);
      // Refresh orders list
      await fetchOrders();
      return response;
    } catch (err) {
      console.error('Hook: Error updating order:', err);
      setError(err.message || 'Error updating order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Patch order (partial update)
   * @param {string} id - Order UUID
   * @param {Object} partialData - Partial order data
   */
  const patchOrder = async (id, partialData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Patching order:', id, partialData);
      const response = await orderService.patchOrder(id, partialData);
      console.log('Hook: Order patched successfully:', response);
      // Refresh orders list
      await fetchOrders();
      return response;
    } catch (err) {
      console.error('Hook: Error patching order:', err);
      setError(err.message || 'Error patching order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete order
   * @param {string} id - Order UUID
   */
  const deleteOrder = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Deleting order:', id);
      const response = await orderService.deleteOrder(id);
      console.log('Hook: Order deleted successfully:', response);
      // Refresh orders list
      await fetchOrders();
      return response;
    } catch (err) {
      console.error('Hook: Error deleting order:', err);
      setError(err.message || 'Error deleting order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update order status
   * @param {string} id - Order UUID
   * @param {string} status - CONFIRMED | PROCESSING | COMPLETED | CANCELED
   */
  const updateOrderStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Updating order status:', id, status);
      const response = await orderService.updateOrderStatus(id, status);
      console.log('Hook: Order status updated successfully:', response);
      // Refresh orders list
      await fetchOrders();
      return response;
    } catch (err) {
      console.error('Hook: Error updating order status:', err);
      setError(err.message || 'Error updating order status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchOrders().catch(err => {
        console.error('Initial fetch orders failed:', err);
      });
    }
  }, [autoFetch]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    patchOrder,
    deleteOrder,
    updateOrderStatus
  };
};

export default useOrders;

