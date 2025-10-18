import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const authService = {
  signup: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signup, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  login: async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.login, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.me);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post(endpoints.auth.refresh);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.forgotPassword, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
      const response = await axiosInstance.post(endpoints.auth.changePassword, {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
