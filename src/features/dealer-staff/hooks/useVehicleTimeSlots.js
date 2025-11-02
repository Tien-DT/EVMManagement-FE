// src/features/dealer-staff/hooks/useVehicleTimeSlots.js
import { useState, useEffect, useCallback } from "react";
import { testDriveService } from "../services/testDriveService";

export const useVehicleTimeSlots = (dealerId) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimeSlots = useCallback(async () => {
    if (!dealerId) {
      console.log("No dealerId provided, skipping fetch");
      setError("Dealer ID is required");
      setIsLoading(false);
      return;
    }

    console.log("Fetching vehicle time slots for dealerId:", dealerId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await testDriveService.getVehicleTimeSlotsByDealer(dealerId);

      console.log("Vehicle time slots API response:", response);

      if (response.success && response.data) {
        let slotsData = [];

        if (Array.isArray(response.data.items)) {
          slotsData = response.data.items;
        } else if (Array.isArray(response.data.data)) {
          slotsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          slotsData = response.data;
        }

        setTimeSlots(slotsData);
      } else {
        console.error("Response not successful or no data:", response);
        setError(response.message || "Failed to fetch vehicle time slots");
        setTimeSlots([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle time slots:", err);
      setError(err.message || "Failed to fetch vehicle time slots");
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [dealerId]);

  const fetchAvailableSlots = useCallback(
    async (filters = {}) => {
      if (!dealerId) {
        console.log("No dealerId provided, skipping fetch");
        return [];
      }

      try {
        const response = await testDriveService.getAvailableSlots({
          dealerId,
          ...filters,
        });

        console.log("Available slots API response:", response);

        if (response.success && response.data) {
          if (Array.isArray(response.data.items)) {
            return response.data.items;
          } else if (Array.isArray(response.data.data)) {
            return response.data.data;
          } else if (Array.isArray(response.data)) {
            return response.data;
          }
        }

        return [];
      } catch (err) {
        console.error("Error fetching available slots:", err);
        return [];
      }
    },
    [dealerId]
  );

  const fetchActiveMasterTimeSlots = useCallback(async () => {
    try {
      const response = await testDriveService.getActiveMasterTimeSlots();

      console.log("Active master time slots API response:", response);

      if (response.success && response.data) {
        if (Array.isArray(response.data.items)) {
          return response.data.items;
        } else if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }

      return [];
    } catch (err) {
      console.error("Error fetching active master time slots:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (dealerId) {
      fetchTimeSlots();
    }
  }, [dealerId, fetchTimeSlots]);

  return {
    timeSlots,
    isLoading,
    error,
    refreshTimeSlots: fetchTimeSlots,
    fetchAvailableSlots,
    fetchActiveMasterTimeSlots,
  };
};

export default useVehicleTimeSlots;
