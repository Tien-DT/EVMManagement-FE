// src/features/evm-staff/services/customerService.js
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const customerService = {
  /**
   * Get all customers with pagination
   * @param {Object} params - { pageNumber, pageSize }
   */
  getAllCustomers: async (params = {}) => {
    try {
      console.log('Service: Fetching all customers with params:', params);
      const response = await axiosInstance.get(endpoints.customers.getAll, { params });
      console.log('Service: All customers response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching all customers:', error);
      throw error;
    }
  },

  /**
   * Get customer by ID
   * @param {string} id - Customer UUID
   */
  getCustomerById: async (id) => {
    try {
      console.log('Service: Fetching customer by ID:', id);
      const response = await axiosInstance.get(endpoints.customers.getById(id));
      console.log('Service: Customer by ID response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching customer by ID:', error);
      throw error;
    }
  },

  /**
   * Get customers by dealer ID
   * @param {string} dealerId - Dealer UUID
   * @param {Object} params - { pageNumber, pageSize }
   */
  getCustomersByDealer: async (dealerId, params = {}) => {
    try {
      console.log('Service: Fetching customers by dealer:', dealerId);
      const response = await axiosInstance.get(
        endpoints.customers.getByDealer(dealerId),
        { params }
      );
      console.log('Service: Customers by dealer response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error fetching customers by dealer:', error);
      throw error;
    }
  },

  /**
   * Search customers
   * @param {Object} params - Search parameters
   */
  searchCustomers: async (params = {}) => {
    try {
      console.log('Service: Searching customers with params:', params);
      const response = await axiosInstance.get(endpoints.customers.search, { params });
      console.log('Service: Search customers response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error searching customers:', error);
      throw error;
    }
  }
};

export default customerService;

