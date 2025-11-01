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
    mode: "onChange", // Validate realtime when user types
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
      // Get dealerId from userProfile
      const userProfileStr = localStorage.getItem("userProfile");
      let dealerId = null;
      
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          dealerId = userProfile.dealerId;
        } catch (err) {
          console.error("Error parsing userProfile:", err);
        }
      }

      if (!dealerId) {
        return {
          success: false,
          error: "Không tìm thấy dealerId. Vui lòng đăng nhập lại.",
        };
      }

      // Format dob to ISO string and add dealerId
      const formattedData = {
        ...data,
        dob: new Date(data.dob).toISOString(),
        dealerId: dealerId, // Add dealerId to payload
      };

      console.log("Creating customer with data:", formattedData);

      const response = await customerService.createCustomer(formattedData);

      if (response.success) {
        reset();
        return { success: true, data: response.data };
      } else {
        // Return detailed error from API
        const errorMsg = response.message || response.errors || "Không thể tạo khách hàng";
        console.error("API returned error:", response);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Create customer error:", error);
      
      // Extract detailed error from response
      let errorMessage = "Không thể tạo khách hàng";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from API
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
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
