// src/features/dealer-staff/hooks/useDealerCustomers.js
import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";

export const useDealerCustomers = (dealerId) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For dealer staff, use the managed-by endpoint to get all customers
        // This endpoint automatically returns customers managed by the current dealer staff
        const response = await customerService.getAllManagedCustomers();

        if (response.success && response.data) {
          setCustomers(response.data);
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
  }, [dealerId]); // Keep dealerId in dependency array for consistency, but we don't use it

  return { customers, isLoading, error };
};