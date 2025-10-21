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

  // Kiểm tra role với includes để support nhiều format
  const userRole = user.role?.toLowerCase() || "";
  console.log("🔍 DEBUG - RoleBasedRoute - User role:", userRole);
  console.log("🔍 DEBUG - RoleBasedRoute - Allowed roles:", allowedRoles);

  // Kiểm tra role với nhiều định dạng khác nhau
  const hasRole = allowedRoles.some((role) => {
    const normalizedAllowed = role.toLowerCase();
    
    // Hỗ trợ nhiều định dạng role từ backend
    // 1. Kiểm tra chính xác (case insensitive)
    if (userRole.toLowerCase() === normalizedAllowed) return true;
    
    // 2. Kiểm tra với dấu gạch ngang thay cho gạch dưới
    const dashFormat = userRole.toLowerCase().replace(/_/g, "-");
    if (dashFormat === normalizedAllowed) return true;
    
    // 3. Kiểm tra với includes cho các trường hợp role có tiền tố
    if (normalizedAllowed === "admin" && userRole.toLowerCase().includes("admin")) return true;
    if (normalizedAllowed === "dealer" && userRole.toLowerCase() === "dealer_manager") return true;
    if (normalizedAllowed === "dealer-staff" && userRole.toLowerCase() === "dealer_staff") return true;
    if (normalizedAllowed === "evm-staff" && userRole.toLowerCase().includes("evm_staff")) return true;
    
    console.log(`🔍 DEBUG - Comparing: user role "${userRole}" with allowed role "${normalizedAllowed}" - No match`);
    return false;
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
    } else if (normalizedRole === "dealer-staff") {
      return <Navigate to="/dealer-staff/customers" replace />;
    } else if (normalizedRole === "dealer") {
      return <Navigate to="/dealer/dashboard" replace />;
    } else if (normalizedRole.includes("evm_staff")) {
      return <Navigate to="/evm-staff/dashboard" replace />;
    }

    // Nếu không match role nào, logout
    return <Navigate to="/login" replace />;
  }

  // Nếu có quyền, render tiếp
  return <Outlet />;
};

export default RoleBasedRoute;
