// src/features/dealer-manager/hooks/useCreateTimeSlot.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { masterTimeSlotService } from "../services/masterTimeSlotService";
import { timeToMinutes, calculateDuration } from "../../../utils/timeUtils";

export const useCreateTimeSlot = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createTimeSlot = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Tính toán startOffsetMinutes và durationMinutes
      const startOffsetMinutes = timeToMinutes(
        formData.startHour,
        formData.startMinute
      );
      const durationMinutes = calculateDuration(
        formData.startHour,
        formData.startMinute,
        formData.endHour,
        formData.endMinute
      );

      // Payload gửi lên API
      const payload = {
        code: formData.code,
        startOffsetMinutes,
        durationMinutes,
        isActive: formData.isActive,
      };

      console.log("Submitting payload:", payload);

      await masterTimeSlotService.create(payload);

      // Thông báo thành công và chuyển về trang danh sách
      alert("Tạo slot thành công!");
      navigate("/dealer/time-slots");

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Không thể tạo slot";
      setError(errorMessage);
      console.error("Create time slot error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTimeSlot,
    isSubmitting,
    error,
    setError,
  };
};
