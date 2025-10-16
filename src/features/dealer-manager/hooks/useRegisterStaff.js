import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerStaffSchema } from "../schemas/registerStaffSchema";
import { dealerService } from "../services/dealerService";
import { useAuth } from "../../../context/AuthContext";

export const useRegisterStaff = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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

      console.log("✅ DealerId found:", dealerId);

      // Đăng ký staff với dealerId
      const staffData = {
        email: data.email,
        fullName: data.fullName,
        dealerId: dealerId,
        phone: data.phone,
        cardId: data.cardId,
        role: "DEALER_MANAGER",
      };

      const response = await dealerService.registerStaff(staffData);

      if (response.success) {
        console.log("✅ Staff registered successfully");
        setSuccess(true);
        form.reset();
        // Có thể redirect hoặc hiển thị thông báo thành công
        setTimeout(() => {
          navigate("/dealer/dashboard", {
            replace: true,
            state: { message: "Đăng ký nhân viên thành công!" },
          });
        }, 2000);
      } else {
        throw new Error(response.message || "Đăng ký nhân viên thất bại");
      }
    } catch (err) {
      console.error("❌ Register staff error:", err);
      setError(err.message || "Đăng ký nhân viên thất bại. Vui lòng thử lại.");
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
