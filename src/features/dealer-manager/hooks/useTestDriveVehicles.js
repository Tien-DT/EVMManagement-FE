import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testDriveService } from "../services/testDriveService";
import { useAuth } from "../../../context/AuthContext";

export const useTestDriveVehicles = () => {
  const { user } = useAuth();
  const dealerId = user?.dealerId;
  const queryClient = useQueryClient();

  const {
    data: vehicles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["testDriveVehicles", dealerId],
    queryFn: () => testDriveService.getTestDriveVehicles(dealerId),
    enabled: !!dealerId,
  });

  const addVehicleMutation = useMutation({
    mutationFn: (vehicleData) => testDriveService.addVehicleToSlot(vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testDriveVehicles", dealerId],
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ vehicleId, status }) =>
      testDriveService.updateTestDriveVehicleStatus(vehicleId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testDriveVehicles", dealerId],
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId) =>
      testDriveService.deleteTestDriveVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testDriveVehicles", dealerId],
      });
    },
  });

  return {
    vehicles,
    isLoading,
    error,
    addVehicle: addVehicleMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deleteVehicle: deleteVehicleMutation.mutate,
    isAdding: addVehicleMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteVehicleMutation.isPending,
  };
};
