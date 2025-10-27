// src/features/dealer-staff/hooks/useOrders.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { orderService } from "../services/orderService";

export const useOrders = (dealerId, filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const serializedFilters = useMemo(
    () => JSON.stringify(filters || {}),
    [filters]
  );

  // ✅ FIX: Sử dụng useCallback để memoize fetchOrders
  const fetchOrders = useCallback(
    async (pageNumber = 1, pageSize = 10) => {
      if (!dealerId) {
        console.log("No dealerId provided, skipping fetch");
        setError("Dealer ID is required");
        setIsLoading(false);
        return;
      }

      console.log(
        "Fetching orders for dealerId:",
        dealerId,
        "page:",
        pageNumber
      );
      setIsLoading(true);
      setError(null);

      try {
        const filterParams = serializedFilters
          ? JSON.parse(serializedFilters)
          : {};
        const response = await orderService.getOrdersByDealer(
          dealerId,
          pageNumber,
          pageSize,
          filterParams
        );

        console.log("Orders API response:", response);

        if (response.success && response.data) {
          console.log(
            "Full response structure:",
            JSON.stringify(response, null, 2)
          );

          // Xử lý đúng cấu trúc response từ API
          let ordersData = [];
          let paginationInfo = {
            currentPage: pageNumber,
            pageSize: pageSize,
            totalPages: 0,
            totalItems: 0,
          };

          // Kiểm tra response.data có phải là object chứa items không
          if (response.data && typeof response.data === "object") {
            // Trường hợp 1: response.data.items là array
            if (Array.isArray(response.data.items)) {
              ordersData = response.data.items;
              console.log("Found items array:", ordersData.length);
            }
            // Trường hợp 2: response.data.data là array
            else if (Array.isArray(response.data.data)) {
              ordersData = response.data.data;
              console.log("Found data array:", ordersData.length);
            }
            // Trường hợp 3: response.data chính nó là array
            else if (Array.isArray(response.data)) {
              ordersData = response.data;
              console.log("Response.data is array:", ordersData.length);
            }

            // Lấy thông tin pagination nếu có
            paginationInfo = {
              currentPage:
                response.data.pageNumber ||
                response.data.currentPage ||
                pageNumber,
              pageSize: response.data.pageSize || pageSize,
              totalPages:
                response.data.totalPages ||
                Math.ceil(ordersData.length / pageSize),
              totalItems:
                response.data.totalItems ||
                response.data.totalCount ||
                ordersData.length,
            };
          }

          const sortedOrders = [...ordersData].sort((a, b) => {
            const createdA = a?.createdDate ? new Date(a.createdDate).getTime() : 0;
            const createdB = b?.createdDate ? new Date(b.createdDate).getTime() : 0;
            return createdB - createdA;
          });

          console.log("Processed ordersData:", sortedOrders);
          console.log("Number of orders:", sortedOrders.length);
          console.log("Pagination info:", paginationInfo);

          setOrders(sortedOrders);
          setPagination(paginationInfo);
        } else {
          console.error("Response not successful or no data:", response);
          setError(response.message || "Failed to fetch orders");
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    },
    [dealerId, serializedFilters]
  ); // ✅ Chỉ phụ thuộc vào dealerId và serializedFilters

  const refreshOrders = useCallback(() => {
    fetchOrders(pagination.currentPage, pagination.pageSize);
  }, [fetchOrders, pagination.currentPage, pagination.pageSize]);

  const deleteOrder = useCallback(
    async (id) => {
      try {
        const response = await orderService.deleteOrder(id);
        if (response.success) {
          refreshOrders();
          return { success: true };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        console.error("Error deleting order:", err);
        return { success: false, message: err.message };
      }
    },
    [refreshOrders]
  );

  const changePage = useCallback(
    (newPage) => {
      fetchOrders(newPage, pagination.pageSize);
    },
    [fetchOrders, pagination.pageSize]
  );

  // ✅ FIX: useEffect với dependency đúng
  useEffect(() => {
    console.log("useEffect triggered - dealerId:", dealerId);
    if (dealerId) {
      fetchOrders(1, 10);
    }
  }, [dealerId, fetchOrders, serializedFilters]); // ✅ Bao gồm cả fetchOrders

  return {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    deleteOrder,
    changePage,
  };
};

export default useOrders;
