import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/loginSchema";
import { authService } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";

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
  const { showSuccess, showError } = useNotification();

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

      console.log("Login response received:", response);

      // Access token từ response.data.accessToken
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        console.error("No access token in response.data");
        throw new Error("No access token received");
      }

      console.log(
        "🔑 Access token found:",
        accessToken.substring(0, 20) + "..."
      );

      // Decode token để lấy user info
      const decodedToken = decodeToken(accessToken);
      console.log("📋 Token decoded successfully:", decodedToken);

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

      // Fetch UserProfile để lấy dealerId
      try {
        console.log("📞 Fetching user profile for account:", userInfo.id);
        const profileResponse = await authService.getUserProfile(userInfo.id);

        if (profileResponse.success && profileResponse.data) {
          console.log("✅ User profile fetched:", profileResponse.data);

          // Add UserProfile info to userInfo
          userInfo.userProfileId = profileResponse.data.id; // ← IMPORTANT: UserProfile ID for CreatedByUserId
          userInfo.dealerId = profileResponse.data.dealerId;
          userInfo.fullName = profileResponse.data.fullName || userInfo.name;
          userInfo.phoneNumber = profileResponse.data.phoneNumber;

          // Save full profile to localStorage
          localStorage.setItem(
            "userProfile",
            JSON.stringify(profileResponse.data)
          );

          console.log(
            "💾 User profile saved with userProfileId:",
            userInfo.userProfileId,
            "dealerId:",
            userInfo.dealerId
          );
        }
      } catch (profileError) {
        console.warn("⚠️ Could not fetch user profile:", profileError);
        // Continue anyway - some users might not have a profile yet
      }

      // Lưu vào context
      login(userInfo, accessToken);

      console.log("💾 Login data saved to context");

      // Show success notification
      showSuccess(`Welcome back, ${userInfo.name || userInfo.email}! Sign in successful.`);

      // Navigate với role normalization
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
      console.error("Login error:", err);
      const errorMessage = err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
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
    setError,
  };
};
