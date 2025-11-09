// src/features/dealer-staff/services/customerService.js
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const customerService = {
  // Get all customers with pagination
  getAllCustomers: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.customers.getAll, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get all customers response:", response);
      return response;
    } catch (error) {
      console.error("Get all customers error:", error);
      throw error;
    }
  },

  // Get customers by dealer ID
  getCustomersByDealer: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        endpoints.customers.getByDealer(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get customers by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get customers by dealer error:", error);
      throw error;
    }
  },

  // Get customers managed by current dealer staff (new API)
  getManagedCustomers: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.customers.managedBy, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get managed customers response:", response);
      return response;
    } catch (error) {
      console.error("Get managed customers error:", error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.customers.getById(id));
      console.log("Get customer by ID response:", response);
      return response;
    } catch (error) {
      console.error("Get customer by ID error:", error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.customers.create,
        data
      );
      console.log("Create customer response:", response);
      return response;
    } catch (error) {
      console.error("Create customer error:", error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        endpoints.customers.update(id),
        data
      );
      console.log("Update customer response:", response);
      return response;
    } catch (error) {
      console.error("Update customer error:", error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await axiosInstance.delete(
        endpoints.customers.delete(id)
      );
      console.log("Delete customer response:", response);
      return response;
    } catch (error) {
      console.error("Delete customer error:", error);
      throw error;
    }
  },

  // Search customers
  searchCustomers: async (searchTerm, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.customers.search, {
        params: {
          searchTerm,
          pageNumber,
          pageSize,
        },
      });
      console.log("Search customers response:", response);
      return response;
    } catch (error) {
      console.error("Search customers error:", error);
      throw error;
    }
  },
};