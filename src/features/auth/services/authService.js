import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const authService = {
  signup: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signup, data);
      console.log("Signup API response:", response);

      // API trả về { success, message, data, errors, errorCode }
      if (response.success) {
        return response; // Trả về toàn bộ response
      } else {
        // Nếu success = false
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Signup service error:", error);
      // Error đã được xử lý ở axios interceptor
      throw error;
    }
  },

  login: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.login, data);
      console.log("Login API response:", response);
      return response;
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.me);
      return response;
    } catch (error) {
      console.error("GetMe service error:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post(endpoints.auth.refresh);
      return response;
    } catch (error) {
      console.error("RefreshToken service error:", error);
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
      console.error("ForgotPassword service error:", error);
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.verifyOtp, { email, code: otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.resetPassword, {
        email: data.email,
        resetToken: data.resetToken,
        newPassword: data.newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserProfile: async (accountId) => {
    try {
      const response = await axiosInstance.get(endpoints.userProfile.byAccount(accountId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (data) => {
    try {
      // Try the most common field names for change password APIs
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      
      console.log("Change password payload:", payload);
      console.log("API endpoint:", endpoints.auth.changePassword);
      
      const response = await axiosInstance.post(endpoints.auth.changePassword, payload);
      console.log("Change password API response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      return response;
    } catch (error) {
      console.error("Change password API error:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      throw error;
    }
  },

  // Test function to try different field name combinations
  testChangePassword: async (data) => {
    const fieldCombinations = [
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { oldPassword: data.currentPassword, newPassword: data.newPassword },
      { currentPassword: data.currentPassword, password: data.newPassword },
      { oldPassword: data.currentPassword, password: data.newPassword },
    ];

    for (let i = 0; i < fieldCombinations.length; i++) {
      try {
        console.log(`Trying field combination ${i + 1}:`, fieldCombinations[i]);
        const response = await axiosInstance.post(endpoints.auth.changePassword, fieldCombinations[i]);
        console.log(`Success with combination ${i + 1}:`, response);
        return response;
      } catch (error) {
        console.log(`Failed with combination ${i + 1}:`, error.response?.data);
        if (i === fieldCombinations.length - 1) {
          throw error;
        }
      }
    }
  },

  getUserProfileByAccount: async (accountId) => {
    try {
      const response = await axiosInstance.get(`/v1/UserProfile/by-account/${accountId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post(endpoints.auth.logout);
      return response;
    } catch (error) {
      console.error("Logout service error:", error);
      // Even if the API call fails, we should still clear local storage
      throw error;
    }
  },
};
