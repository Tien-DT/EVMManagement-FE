import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { warehouseSchema } from "../schemas/warehouseSchema";
import { dealerService } from "../services/dealerService";
import { useAuth } from "../../../context/AuthContext";

export const useCreateWarehouse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 100,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🏭 Creating warehouse for user:", user.id);

      // Lấy user profile để có dealerId
      const userProfile = await dealerService.getUserProfile(user.id);
      const dealerId = userProfile.data?.dealerId;

      if (!dealerId) {
        throw new Error("Không tìm thấy thông tin dealer của tài khoản này");
      }

      console.log("✅ DealerId found:", dealerId);

      // Tạo warehouse với dealerId
      const warehouseData = {
        name: data.name,
        address: data.address,
        capacity: data.capacity,
        type: "DEALER",
        dealerId: dealerId,
      };

      const response = await dealerService.createWarehouse(warehouseData);

      if (response.success) {
        console.log("✅ Warehouse created successfully");
        navigate("/dealer/warehouses", {
          replace: true,
          state: { message: "Tạo kho hàng thành công!" },
        });
      } else {
        throw new Error(response.message || "Tạo kho hàng thất bại");
      }
    } catch (err) {
      console.error("❌ Create warehouse error:", err);
      setError(err.message || "Tạo kho hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    error,
    setError,
  };
};
