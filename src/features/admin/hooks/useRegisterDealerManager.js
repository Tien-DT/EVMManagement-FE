import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerDealerManagerSchema } from "../schemas/registerDealerManagerSchema";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

export const useRegisterDealerManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const form = useForm({
    resolver: zodResolver(registerDealerManagerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      dealerId: "",
      phone: "",
      cardId: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("👤 Registering dealer manager:", data);

      // Add role: DEALER_MANAGER to payload
      const payload = {
        ...data,
        role: "DEALER_MANAGER",
      };

      const response = await axiosInstance.post(
        endpoints.dealer.registerStaff,
        payload
      );

      console.log("✅ Registration successful:", response);
      setSuccess(true);
      showSuccess("Đăng ký dealer manager thành công!");
      form.reset();

      // Redirect to dealer detail page to see the new manager
      setTimeout(() => {
        navigate(`/admin/dealers/${data.dealerId}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error("❌ Register dealer manager error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
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

