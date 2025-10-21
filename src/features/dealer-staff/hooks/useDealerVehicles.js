// src/features/dealer-staff/hooks/useDealerVehicles.js
import { useState, useEffect } from "react";
import { dealerService } from "../../dealer-manager/services/dealerService";

export const useDealerVehicles = (dealerId) => {
  const [vehicles, setVehicles] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!dealerId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await dealerService.getWarehousesByDealer(
          dealerId,
          1,
          10
        );

        console.log("Warehouse response:", response);

        if (response.success && response.data) {
          // Lấy warehouse đầu tiên (business rule: 1 dealer = 1 warehouse)
          const warehouseData = Array.isArray(response.data)
            ? response.data[0]
            : response.data.items?.[0] || response.data;

          if (warehouseData) {
            setWarehouse(warehouseData);
            // Lấy danh sách vehicles từ warehouse
            const vehiclesData = warehouseData.vehicles || [];
            setVehicles(vehiclesData);
            console.log("Vehicles found:", vehiclesData.length);
          } else {
            setWarehouse(null);
            setVehicles([]);
          }
        } else {
          setWarehouse(null);
          setVehicles([]);
        }
      } catch (err) {
        console.error("Fetch vehicles error:", err);
        setError(err.message || "Không thể tải danh sách xe");
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [dealerId]);

  return { vehicles, warehouse, isLoading, error };
};