import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerStaffSchema } from "../schemas/registerStaffSchema";
import { dealerService } from "../services/dealerService";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";

export const useRegisterStaff = (options = {}) => {
  const { skipNavigation = false } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const form = useForm({
    resolver: zodResolver(registerStaffSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      cardId: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("👤 Registering staff for user:", user.id);

      // Lấy user profile để có dealerId
      const userProfile = await dealerService.getUserProfile(user.id);
      const dealerId = userProfile.data?.dealerId;

      if (!dealerId) {
        throw new Error("Không tìm thấy thông tin dealer của tài khoản này");
      }

      console.log("DealerId found:", dealerId);

      // Đăng ký staff với dealerId
      const staffData = {
        email: data.email,
        fullName: data.fullName,
        dealerId: dealerId,
        phone: data.phone,
        cardId: data.cardId,
        role: "DEALER_STAFF",
      };

      const response = await dealerService.registerStaff(staffData);

      console.log("✅ Staff registered successfully:", response);
      setSuccess(true);
      showSuccess("Đăng ký nhân viên thành công!");
      form.reset();

      // Only navigate if skipNavigation is false (when used in modal, skipNavigation should be true)
      if (!skipNavigation) {
        setTimeout(() => {
          navigate("/dealer/dashboard", {
            replace: true,
            state: { message: "Đăng ký nhân viên thành công!" },
          });
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Register staff error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký nhân viên thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    error,
    success,
    setError,
  };
};
