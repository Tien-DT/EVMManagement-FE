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
      if (!dealerId) {
        console.log("❌ No dealerId provided to useDealerVehicles hook");
        return;
      }

      console.log("🚗 Fetching vehicles for dealerId:", dealerId);
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔍 Calling getWarehousesByDealer API with dealerId:", dealerId);
        const response = await dealerService.getWarehousesByDealer(
          dealerId,
          1,
          10
        );

        console.log("📦 Warehouse API response:", response);
        console.log("📦 Response data type:", typeof response.data);
        console.log("📦 Is array?", Array.isArray(response.data));
        console.log("📦 Full response structure:", JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          // Lấy warehouse đầu tiên (business rule: 1 dealer = 1 warehouse)
          const warehouseData = Array.isArray(response.data)
            ? response.data[0]
            : response.data.items?.[0] || response.data;

          console.log("🏭 Warehouse data:", warehouseData);

          if (warehouseData) {
            setWarehouse(warehouseData);
            // Lấy danh sách vehicles từ warehouse
            const vehiclesData = warehouseData.vehicles || [];
            console.log("🚗 Vehicles in warehouse:", vehiclesData);
            console.log("🚗 Vehicles data type:", typeof vehiclesData);
            console.log("🚗 Is vehicles array?", Array.isArray(vehiclesData));
            console.log("🚗 Vehicles found:", vehiclesData.length);
            
            setVehicles(vehiclesData);
          } else {
            console.log("❌ No warehouse data found in response");
            setWarehouse(null);
            setVehicles([]);
          }
        } else {
          console.log("❌ API response unsuccessful or no data");
          setWarehouse(null);
          setVehicles([]);
        }
      } catch (err) {
        console.error("❌ Fetch vehicles error:", err);
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