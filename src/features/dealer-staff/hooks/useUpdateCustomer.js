// src/features/dealer-staff/hooks/useUpdateCustomer.js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema } from "../schemas/customerSchema";
import { customerService } from "../services/customerService";
import { useState, useEffect } from "react";

export const useUpdateCustomer = (customerId) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
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

  // Load customer data when component mounts
  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    if (!customerId) {
      console.error("No customerId provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔍 Fetching customer data for ID:", customerId);
      
      const response = await customerService.getCustomerById(customerId);
      console.log("📦 Customer data response:", response);

      // Handle different response formats
      // axiosInstance interceptor returns response.data directly
      const customerData = response?.data || response;
      
      if (!customerData) {
        console.error("❌ No customer data found in response");
        return;
      }

      console.log("✅ Customer data loaded:", customerData);
      
      // Format dob from ISO string to date input format (YYYY-MM-DD)
      const dobValue = customerData.dob 
        ? new Date(customerData.dob).toISOString().split('T')[0]
        : "";

      // Reset form with customer data
      // Handle gender format: API might return MALE/FEMALE/OTHER, form needs male/female/other
      let genderValue = customerData.gender?.toLowerCase() || "";
      if (genderValue === "male" || genderValue === "female" || genderValue === "other") {
        // Already in correct format
      } else if (customerData.gender) {
        // Convert from uppercase to lowercase
        genderValue = customerData.gender.toLowerCase();
      }

      reset({
        fullName: customerData.fullName || "",
        phone: customerData.phone || "",
        email: customerData.email || "",
        gender: genderValue,
        address: customerData.address || "",
        dob: dobValue,
        cardId: customerData.cardId || "",
      });
      
      console.log("✅ Form reset with customer data");
    } catch (error) {
      console.error("❌ Error fetching customer data:", error);
      // Don't throw error, just log it
      // The component will show loading state, then show form (even if empty)
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Get dealerId from userProfile (API might require it)
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

      // Format data for API: convert empty strings to null and format dob
      const formattedData = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        gender: data.gender,
        address: data.address && data.address.trim() !== "" ? data.address : null,
        dob: data.dob && data.dob.trim() !== "" ? new Date(data.dob).toISOString() : null,
        cardId: data.cardId && data.cardId.trim() !== "" ? data.cardId : null,
        // Include dealerId if available (API might require it)
        ...(dealerId && { dealerId }),
      };

      console.log("Updating customer with data:", formattedData);

      const response = await customerService.updateCustomer(customerId, formattedData);
      console.log("Update customer response:", response);

      // Handle different response formats
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        return { success: true, data: result };
      } else {
        const errorMsg = response?.message || response?.errors || "Không thể cập nhật khách hàng";
        console.error("API returned error:", response);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Update customer error:", error);
      
      let errorMessage = "Không thể cập nhật khách hàng";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
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
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    isLoading,
    reset,
    setValue,
    watch,
  };
};

