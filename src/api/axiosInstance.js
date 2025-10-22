// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://evm-redg.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // BỎ header này vì nó gây lỗi CORS
    // "Access-Control-Allow-Origin": "*",
  },
  timeout: 30000, // Tăng timeout lên 30s cho server Render
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
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
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userProfile");

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
