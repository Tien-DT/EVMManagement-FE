// PrivateRoute.jsx - Fixed version
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // 🕓 Chờ context khởi tạo xong
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // 🚫 Nếu chưa có user => quay lại login
  if (!isAuthenticated || !user) {
    console.log("🚫 Not authenticated, redirecting to login");
    // Lưu location hiện tại để redirect lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("User authenticated:", user);
  // Nếu có user, render nội dung bên trong
  return <Outlet />;
};

export default PrivateRoute;
