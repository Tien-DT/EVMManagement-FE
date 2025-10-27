// src/features/dealer-manager/hooks/useDealerManagerOrders.js
import { useState, useEffect, useCallback } from "react";
import { orderService } from "../../dealer-staff/services/orderService";

export const useDealerManagerOrders = (dealerId) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0,
  });

  const fetchOrders = useCallback(
    async (pageNumber = 1, pageSize = 20) => {
      if (!dealerId) {
        console.log("No dealerId provided, skipping fetch");
        setError("Dealer ID is required");
        setIsLoading(false);
        return;
      }

      console.log("Fetching orders for dealerId:", dealerId, "page:", pageNumber);
      setIsLoading(true);
      setError(null);

      try {
        const response = await orderService.getOrdersByDealer(
          dealerId,
          pageNumber,
          pageSize
        );

        console.log("Orders API response:", response);

        if (response.success && response.data) {
          let ordersData = [];
          let paginationInfo = {
            currentPage: pageNumber,
            pageSize: pageSize,
            totalPages: 0,
            totalItems: 0,
          };

          if (response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.items)) {
              ordersData = response.data.items;
            } else if (Array.isArray(response.data.data)) {
              ordersData = response.data.data;
            } else if (Array.isArray(response.data)) {
              ordersData = response.data;
            }

            paginationInfo = {
              currentPage: response.data.pageNumber || response.data.currentPage || pageNumber,
              pageSize: response.data.pageSize || pageSize,
              totalPages: response.data.totalPages || Math.ceil(ordersData.length / pageSize),
              totalItems: response.data.totalItems || response.data.totalCount || ordersData.length,
            };
          }

          console.log("Processed ordersData:", ordersData.length);
          setOrders(ordersData);
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
    [dealerId]
  );

  const refreshOrders = useCallback(() => {
    fetchOrders(pagination.currentPage, pagination.pageSize);
  }, [fetchOrders, pagination.currentPage, pagination.pageSize]);

  const changePage = useCallback(
    (newPage) => {
      fetchOrders(newPage, pagination.pageSize);
    },
    [fetchOrders, pagination.pageSize]
  );

  useEffect(() => {
    console.log("useEffect triggered - dealerId:", dealerId);
    if (dealerId) {
      fetchOrders(1, 20);
    }
  }, [dealerId, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    changePage,
  };
};

export default useDealerManagerOrders;
