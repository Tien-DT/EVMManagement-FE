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

  changePassword: async (payload) => {
    try {
      // payload: { oldPassword, newPassword }
      const response = await axiosInstance.post(endpoints.auth.changePassword, payload);
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
};
