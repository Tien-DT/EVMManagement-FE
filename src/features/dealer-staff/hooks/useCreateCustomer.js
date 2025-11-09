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
      // Try to get dealerId from multiple sources
      let dealerId = null;
      
      // 1. Try from localStorage dealerId (cached)
      const cachedDealerId = localStorage.getItem("dealerId");
      if (cachedDealerId) {
        console.log("✅ Using cached dealerId:", cachedDealerId);
        dealerId = cachedDealerId;
      }
      
      // 2. Try from userProfile in localStorage
      if (!dealerId) {
        const userProfileStr = localStorage.getItem("userProfile");
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            dealerId = userProfile.dealerId;
            if (dealerId) {
              console.log("✅ Using dealerId from userProfile:", dealerId);
              // Cache it for future use
              localStorage.setItem("dealerId", dealerId);
            }
          } catch (err) {
            console.error("Error parsing userProfile:", err);
          }
        }
      }
      
      // 3. Try from user object in localStorage
      if (!dealerId) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            dealerId = user.dealerId;
            if (dealerId) {
              console.log("✅ Using dealerId from user object:", dealerId);
              localStorage.setItem("dealerId", dealerId);
            }
          } catch (err) {
            console.error("Error parsing user:", err);
          }
        }
      }
      
      // 4. If still not found, fetch from API
      if (!dealerId) {
        console.log("🔍 DealerId not found in cache, fetching from API...");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const accountId = user.id || user.accountId;
            
            if (accountId) {
              console.log("🔍 Fetching user profile for accountId:", accountId);
              
              // Import axiosInstance and endpoints
              const axiosInstance = (await import("../../../api/axiosInstance")).default;
              const endpoints = (await import("../../../api/endpoints")).default;
              
              // Fetch user profile
              // Note: axiosInstance interceptor returns response.data directly
              const response = await axiosInstance.get(
                endpoints.userProfile.getByAccount(accountId)
              );
              
              console.log("📦 User profile API response:", response);
              
              // Handle different response formats
              // axiosInstance already returns response.data, so response could be:
              // - {success: true, data: {...}} format (if API wraps it)
              // - Direct data object {...} (most common)
              
              let foundDealerId = null;
              let profileToCache = null;
              
              // Case 1: Response is wrapped {success: true, data: {...}}
              if (response?.success && response?.data) {
                foundDealerId = response.data.dealerId;
                profileToCache = response.data;
              }
              // Case 2: Response is direct data object
              else if (response?.dealerId) {
                foundDealerId = response.dealerId;
                profileToCache = response;
              }
              
              if (foundDealerId) {
                dealerId = foundDealerId;
                console.log("✅ DealerId fetched from API:", dealerId);
                
                // Cache userProfile and dealerId
                if (profileToCache && typeof profileToCache === 'object') {
                  localStorage.setItem("userProfile", JSON.stringify(profileToCache));
                }
                localStorage.setItem("dealerId", dealerId);
              } else {
                console.error("❌ No dealerId found in user profile response");
                console.error("Response structure:", JSON.stringify(response, null, 2));
              }
            }
          } catch (err) {
            console.error("❌ Error fetching user profile:", err);
          }
        }
      }

      if (!dealerId) {
        console.error("❌ DealerId not found after all attempts");
        return {
          success: false,
          error: "Không tìm thấy dealerId. Vui lòng đăng nhập lại.",
        };
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
        dealerId: dealerId, // Add dealerId to payload
      };

      console.log("Creating customer with data:", formattedData);

      const response = await customerService.createCustomer(formattedData);
      console.log("Create customer response:", response);

      // Handle different response formats
      // API might return: {success: true, data: ...} or just the data object
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        // Success - reset form and return success
        reset();
        return { success: true, data: result };
      } else {
        // API returned error in response
        const errorMsg = response?.message || response?.errors || "Không thể tạo khách hàng";
        console.error("API returned error:", response);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Create customer error:", error);
      
      // Extract detailed error message
      // axiosInstance interceptor already extracts error message and throws Error
      let errorMessage = "Không thể tạo khách hàng";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from API
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
    handleSubmit, // Return unwrapped handleSubmit
    onSubmit, // Return the onSubmit function so page can use it
    errors,
    isSubmitting,
    reset,
    setValue,
    watch,
  };
};
