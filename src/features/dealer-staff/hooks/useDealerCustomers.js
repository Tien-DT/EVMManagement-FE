// src/features/dealer-staff/hooks/useDealerCustomers.js
import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";

export const useDealerCustomers = (dealerId) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!dealerId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await customerService.getCustomersByDealer(
          dealerId,
          1,
          1000 // Lấy tất cả customers
        );

        if (response.success && response.data) {
          const customersData = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];
          setCustomers(customersData);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error("Fetch customers error:", err);
        setError(err.message || "Không thể tải danh sách khách hàng");
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [dealerId]);

  return { customers, isLoading, error };
};