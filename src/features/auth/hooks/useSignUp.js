import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { signUpSchema } from "../schemas/signUpSchema";
import { authService } from "../services/authService";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      cardId: "",
      role: "EVM_ADMIN",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("📝 Signup data:", data);

      // ✅ Call API với đúng structure
      const response = await authService.signup({
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
        cardId: data.cardId,
      });

      console.log("✅ Signup successful:", response);

      // ✅ Kiểm tra response
      if (response.success) {
        setSuccessMessage(response.message || "Tạo tài khoản thành công!");

        // Reset form
        form.reset();

        // ✅ Hiện thông báo rồi quay về dashboard sau 2s
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    error,
    setError,
    successMessage,
  };
};
