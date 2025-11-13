import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const warehouseService = {
  // Get all warehouses with pagination
  getAllWarehouses: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(endpoints.admin.warehouses, {
        params: {
          pageNumber,
          pageSize,
        },
      });
      console.log("Get warehouses response:", response);
      return response;
    } catch (error) {
      console.error("Get warehouses error:", error);
      throw error;
    }
  },

  // Get warehouse by ID
  getWarehouseById: async (id) => {
    try {
      const response = await axiosInstance.get(
        endpoints.admin.warehousesById(id)
      );
      console.log("Get warehouse by id response:", response);
      return response;
    } catch (error) {
      console.error("Get warehouse by id error:", error);
      throw error;
    }
  },

  // Get warehouses by dealer
  getWarehousesByDealer: async (dealerId, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        endpoints.admin.warehousesByDealer(dealerId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );
      console.log("Get warehouses by dealer response:", response);
      return response;
    } catch (error) {
      console.error("Get warehouses by dealer error:", error);
      throw error;
    }
  },

  // Create warehouse
  createWarehouse: async (data) => {
    try {
      const response = await axiosInstance.post(
        endpoints.admin.warehouses,
        data
      );
      console.log("Create warehouse response:", response);
      return response;
    } catch (error) {
      console.error("Create warehouse error:", error);
      throw error;
    }
  },

  // Update warehouse
  updateWarehouse: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        endpoints.admin.warehousesById(id),
        data
      );
      console.log("Update warehouse response:", response);
      return response;
    } catch (error) {
      console.error("Update warehouse error:", error);
      throw error;
    }
  },

  // Delete warehouse
  deleteWarehouse: async (id, isDeleted = true) => {
    try {
      const response = await axiosInstance.delete(
        endpoints.admin.warehousesById(id),
        {
          params: {
            isDeleted,
          },
        }
      );
      console.log("Delete warehouse response:", response);
      return response;
    } catch (error) {
      console.error("Delete warehouse error:", error);
      throw error;
    }
  },
};

export default warehouseService;

