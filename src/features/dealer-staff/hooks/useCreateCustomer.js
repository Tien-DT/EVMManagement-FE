// src/features/dealer-staff/hooks/useCreateCustomer.js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema } from "../schemas/customerSchema";
import { customerService } from "../services/customerService";
import { useState } from "react";

export const useCreateCustomer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      gender: "",
      address: "",
      dob: "",
      cardId: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Format dob to ISO string
      const formattedData = {
        ...data,
        dob: new Date(data.dob).toISOString(),
      };

      const response = await customerService.createCustomer(formattedData);

      if (response.success) {
        reset();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Create customer error:", error);
      return {
        success: false,
        error: error.message || "Không thể tạo khách hàng",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    reset,
    setValue,
    watch,
  };
};
