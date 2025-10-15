// src/router/RoleBasedRoute.jsx - Fixed version
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra quyền...</p>
        </div>
      </div>
    );
  }

  // 🚫 Nếu chưa đăng nhập → đi đến login
  if (!user) {
    console.log("🚫 No user found in RoleBasedRoute");
    return <Navigate to="/login" replace />;
  }

  // ✅ Kiểm tra role với includes để support nhiều format
  const userRole = user.role?.toLowerCase() || "";
  const hasRole = allowedRoles.some((role) => {
    const normalizedAllowed = role.toLowerCase();
    return (
      userRole.includes(normalizedAllowed) || userRole === normalizedAllowed
    );
  });

  console.log("🔍 Role check:", {
    userRole,
    allowedRoles,
    hasRole,
  });

  // ⚠️ Nếu không có quyền
  if (!hasRole) {
    console.warn(`🚫 User role "${user.role}" không có quyền truy cập`);

    // Redirect về trang phù hợp với role
    const normalizedRole = userRole.toLowerCase();

    if (normalizedRole.includes("admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (normalizedRole.includes("dealer")) {
      return <Navigate to="/dealer/dashboard" replace />;
    }

    // Nếu không match role nào, logout
    return <Navigate to="/login" replace />;
  }

  // ✅ Nếu có quyền, render tiếp
  return <Outlet />;
};

export default RoleBasedRoute;
