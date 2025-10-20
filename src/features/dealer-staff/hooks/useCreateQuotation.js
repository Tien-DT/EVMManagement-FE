// src/features/dealer-staff/hooks/useCreateQuotation.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationSchema } from "../schemas/quotationSchema";
import { quotationService } from "../services/quotationService";
import { useAuth } from "../../../hooks/useAuth";

export const useCreateQuotation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      code: "",
      customerId: "",
      createdByUserId: user?.id || "",
      note: "",
      status: "DRAFT",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 ngày sau
      quotationDetails: [
        {
          vehicleVariantId: "",
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          note: "",
        },
      ],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await quotationService.createQuotation(data);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Không thể tạo báo giá");
      }
    } catch (error) {
      console.error("Create quotation error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
    control,
    watch,
    setValue,
    reset,
  };
};
