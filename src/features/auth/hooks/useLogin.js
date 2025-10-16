import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/loginSchema";
import { authService } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";

// Helper function để decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔐 Login attempt:", data.email);

      // Call API login
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      console.log("✅ Login response received:", response);

      // ✅ FIX: Access token từ response.data.accessToken
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        console.error("❌ No access token in response.data");
        throw new Error("No access token received");
      }

      console.log(
        "🔑 Access token found:",
        accessToken.substring(0, 20) + "..."
      );

      // Decode token để lấy user info
      const decodedToken = decodeToken(accessToken);
      console.log("🔓 Token decoded successfully:", decodedToken);

      if (!decodedToken) {
        throw new Error("Invalid token format");
      }

      // Tạo user object từ decoded token
      const userInfo = {
        id: decodedToken.sub || decodedToken.userId || decodedToken.nameid,
        email: decodedToken.email || decodedToken.unique_name || data.email,
        role:
          decodedToken.role ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        name:
          decodedToken.name ||
          decodedToken.unique_name ||
          decodedToken.email ||
          data.email,
      };

      console.log(
        "👤 User info created:",
        userInfo.email,
        "Role:",
        userInfo.role
      );

      // ✅ Lưu vào context
      login(userInfo, accessToken);

      console.log("💾 Login data saved to context");

      // ✅ Navigate với role normalization
      const role = userInfo.role?.toLowerCase() || "";

      if (role.includes("admin")) {
        console.log("📄 Navigating to admin dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else if (role.includes("dealer")) {
        console.log("📄 Navigating to dealer dashboard");
        navigate("/dealer/dashboard", { replace: true });
      } else {
        console.log("📄 Navigating to admin dashboard (default)");
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
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
  };
};
