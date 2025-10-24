// src/features/evm-staff/hooks/useCreateQuotation.js
import { useState } from "react";
import { quotationService } from "../services/quotationService";
import { useAuth } from "../../../hooks/useAuth";

export const useCreateQuotation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const createQuotation = async (data) => {
    setIsSubmitting(true);
    try {
      // Add createdByUserId if not present
      const quotationData = {
        ...data,
        createdByUserId: data.createdByUserId || user?.id || "",
      };

      console.log("Submitting quotation data:", quotationData);
      
      const response = await quotationService.createQuotation(quotationData);
      
      if (response.success || response.data) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Không thể tạo báo giá");
      }
    } catch (error) {
      console.error("Create quotation error:", error);
      return { 
        success: false, 
        error: error.message || "Có lỗi xảy ra khi tạo báo giá" 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuotation = async (id, data) => {
    setIsSubmitting(true);
    try {
      const response = await quotationService.updateQuotation(id, data);
      
      if (response.success || response.data) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Không thể cập nhật báo giá");
      }
    } catch (error) {
      console.error("Update quotation error:", error);
      return { 
        success: false, 
        error: error.message || "Có lỗi xảy ra khi cập nhật báo giá" 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createQuotation,
    updateQuotation,
    isSubmitting,
  };
};

