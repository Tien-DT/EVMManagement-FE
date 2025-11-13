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
        showSuccess("Test drive booking created successfully!");
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Failed to create test drive booking");
      }
    } catch (error) {
      console.error("Error creating test drive booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Unable to create test drive booking";
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
        showSuccess("Confirmation sent successfully!");
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Failed to send confirmation");
      }
    } catch (error) {
      console.error("Error sending confirmation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Unable to send confirmation";
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
        showSuccess(`Sent reminders successfully for ${idsArray.length} bookings!`);
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Unable to send reminder";
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
          showError("Please enter at least one time value");
          return { success: false, error: "Please enter at least one time value" };
        }

        if (checkinAt && checkoutAt) {
          const checkin = new Date(checkinAt);
          const checkout = new Date(checkoutAt);
          if (checkout < checkin) {
            showError("Checkout time must be after the check-in time");
            return { success: false, error: "Checkout time must be after the check-in time" };
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
          ? "Check-in successful!" 
          : action === "checkout" 
          ? "Check-out successful!" 
          : "Check-in/check-out updated successfully!";
        showSuccess(message);
        return { success: true, data: result };
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating check-in/check-out:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        "Unable to update check-in/check-out";
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
