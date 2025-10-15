// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://evm-management-be.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ Đọc từ sessionStorage
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý token expired
    if (error.response?.status === 401) {
      // ✅ Xóa sessionStorage
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");

      // ✅ FIX: Kiểm tra xem có đang ở login không trước khi redirect
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        // Dùng setTimeout để tránh conflict với React Router
        setTimeout(() => {
          window.location.replace("/login");
        }, 100);
      }
    }

    // Lấy error message từ response
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      "Đã có lỗi xảy ra";

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
