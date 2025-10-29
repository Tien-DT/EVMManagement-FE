import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { warehouseSchema } from "../../dealer-manager/schemas/warehouseSchema";
import warehouseService from "../services/warehouseService";

export const useCreateWarehouse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 100,
      dealerId: "",
      type: "DEALER",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const warehouseData = {
        name: data.name,
        address: data.address,
        capacity: data.capacity,
        type: data.type || "DEALER",
        dealerId: data.dealerId,
      };

      const response = await warehouseService.createWarehouse(warehouseData);

      if (response.success) {
        console.log("Warehouse created successfully");
        navigate("/evm-staff/warehouses", {
          replace: true,
          state: { message: "Tạo kho hàng thành công!" },
        });
      } else {
        throw new Error(response.message || "Tạo kho hàng thất bại");
      }
    } catch (err) {
      console.error("Create warehouse error:", err);
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

export const useUpdateWarehouse = (id) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 100,
      dealerId: "",
      type: "DEALER",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const warehouseData = {
        name: data.name,
        address: data.address,
        capacity: data.capacity,
        type: data.type || "DEALER",
        dealerId: data.dealerId,
      };

      const response = await warehouseService.updateWarehouse(id, warehouseData);

      if (response.success) {
        console.log("Warehouse updated successfully");
        navigate("/evm-staff/warehouses", {
          replace: true,
          state: { message: "Cập nhật kho hàng thành công!" },
        });
      } else {
        throw new Error(response.message || "Cập nhật kho hàng thất bại");
      }
    } catch (err) {
      console.error("Update warehouse error:", err);
      setError(err.message || "Cập nhật kho hàng thất bại. Vui lòng thử lại.");
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

