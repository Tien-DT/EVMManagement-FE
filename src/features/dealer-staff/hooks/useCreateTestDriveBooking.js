// src/features/dealer-staff/hooks/useCreateTestDriveBooking.js
import { useState } from "react";
import { testDriveBookingService } from "../services/testDriveBookingService";
import { useNotification } from "../../../context/NotificationContext";

export const useCreateTestDriveBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const createBooking = async (bookingData) => {
    setIsSubmitting(true);
    try {
      console.log("Creating test drive booking:", bookingData);
      const response = await testDriveBookingService.create(bookingData);
      
      // Handle response format
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        showSuccess("Tạo đặt chỗ lái thử thành công!");
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Tạo đặt chỗ lái thử thất bại");
      }
    } catch (error) {
      console.error("Error creating test drive booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Không thể tạo đặt chỗ lái thử";
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendConfirmation = async (bookingId) => {
    setIsSubmitting(true);
    try {
      console.log("Sending confirmation for booking:", bookingId);
      const response = await testDriveBookingService.sendConfirmation(bookingId);
      
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        showSuccess("Gửi xác nhận thành công!");
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Gửi xác nhận thất bại");
      }
    } catch (error) {
      console.error("Error sending confirmation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Không thể gửi xác nhận";
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReminder = async (bookingIds) => {
    setIsSubmitting(true);
    try {
      console.log("Sending reminder for bookings:", bookingIds);
      // Ensure ids is an array
      const idsArray = Array.isArray(bookingIds) ? bookingIds : [bookingIds];
      const response = await testDriveBookingService.sendReminder(idsArray);
      
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        showSuccess(`Gửi nhắc nhở thành công cho ${idsArray.length} đặt chỗ!`);
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Gửi nhắc nhở thất bại");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Không thể gửi nhắc nhở";
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCheckInOut = async (bookingId, checkinAt, checkoutAt, action = null) => {
    setIsSubmitting(true);
    try {
      console.log("Updating check-in/check-out for booking:", bookingId, { checkinAt, checkoutAt, action });
      
      // Validation - only validate for manual updates (when action is null)
      if (!action) {
        if (!checkinAt && !checkoutAt) {
          showError("Vui lòng nhập ít nhất một thời gian");
          return { success: false, error: "Vui lòng nhập ít nhất một thời gian" };
        }

        if (checkinAt && checkoutAt) {
          const checkin = new Date(checkinAt);
          const checkout = new Date(checkoutAt);
          if (checkout < checkin) {
            showError("Thời gian check-out phải sau thời gian check-in");
            return { success: false, error: "Thời gian check-out phải sau thời gian check-in" };
          }
        }
      }

      const response = await testDriveBookingService.updateCheckInOut(
        bookingId,
        checkinAt,
        checkoutAt,
        action
      );
      
      const result = response?.data || response;
      
      if (response?.success !== false && result) {
        const message = action === "checkin" 
          ? "Check-in thành công!" 
          : action === "checkout" 
          ? "Check-out thành công!" 
          : "Cập nhật check-in/check-out thành công!";
        showSuccess(message);
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating check-in/check-out:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Không thể cập nhật check-in/check-out";
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createBooking,
    sendConfirmation,
    sendReminder,
    updateCheckInOut,
    isSubmitting,
  };
};
