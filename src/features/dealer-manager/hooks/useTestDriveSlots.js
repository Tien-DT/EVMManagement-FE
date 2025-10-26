import { useQuery } from "@tanstack/react-query";
import { testDriveService } from "../services/testDriveService";
import { useAuth } from "../../../context/AuthContext";

export const useTestDriveSlots = () => {
  const { user } = useAuth();
  const dealerId = user?.dealerId;

  const {
    data: slots,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["testDriveSlots", dealerId],
    queryFn: () => testDriveService.getTestDriveSlots(dealerId),
    enabled: !!dealerId,
  });

  return {
    slots,
    isLoading,
    error,
  };
};
