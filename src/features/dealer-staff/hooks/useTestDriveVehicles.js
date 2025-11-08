// src/features/dealer-staff/hooks/useTestDriveVehicles.js
import { useState, useEffect } from "react";
import { testDriveService } from "../../dealer-manager/services/testDriveService";
import { useAuth } from "../../../context/AuthContext";

export const useTestDriveVehicles = () => {
  const { user } = useAuth();
  const dealerId = user?.dealerId;
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!dealerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await testDriveService.getTestDriveVehicles(dealerId);
        const data = response?.data || response;
        
        // Handle different response formats
        if (data?.items) {
          setVehicles(data.items);
        } else if (Array.isArray(data)) {
          setVehicles(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setVehicles(data.data);
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error("Error fetching test drive vehicles:", err);
        setError(err.message || "Failed to fetch test drive vehicles");
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [dealerId]);

  // Filter available vehicles (status === "AVAILABLE")
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "AVAILABLE"
  );

  return {
    vehicles,
    availableVehicles,
    isLoading,
    error,
    refetch: () => {
      if (dealerId) {
        setIsLoading(true);
        testDriveService.getTestDriveVehicles(dealerId).then((response) => {
          const data = response?.data || response;
          if (data?.items) {
            setVehicles(data.items);
          } else if (Array.isArray(data)) {
            setVehicles(data);
          } else if (data?.data && Array.isArray(data.data)) {
            setVehicles(data.data);
          }
          setIsLoading(false);
        });
      }
    },
  };
};
