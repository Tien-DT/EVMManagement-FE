// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "30000"),
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("📤 API Request:", {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  },
  (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Xử lý token expired
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");

      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
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
