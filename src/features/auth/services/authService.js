import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const authService = {
  signup: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signup, data);
      console.log("✅ Signup API response:", response);

      // ✅ API trả về { success, message, data, errors, errorCode }
      if (response.success) {
        return response; // Trả về toàn bộ response
      } else {
        // Nếu success = false
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("❌ Signup service error:", error);
      // Error đã được xử lý ở axios interceptor
      throw error;
    }
  },

  login: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.login, data);
      console.log("✅ Login API response:", response);
      return response;
    } catch (error) {
      console.error("❌ Login service error:", error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.me);
      return response;
    } catch (error) {
      console.error("❌ GetMe service error:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post(endpoints.auth.refresh);
      return response;
    } catch (error) {
      console.error("❌ RefreshToken service error:", error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.forgotPassword, {
        email,
      });
      return response;
    } catch (error) {
      console.error("❌ ForgotPassword service error:", error);
      throw error;
    }
  },
};
