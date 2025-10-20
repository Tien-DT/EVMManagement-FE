// src/router/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect based on role
  if (user) {
    const normalizedRole = user.role?.toLowerCase() || "";
    console.log(
      "🔄 User authenticated, redirecting based on role:",
      normalizedRole
    );

    let redirectPath = "/login";

    // Hỗ trợ nhiều định dạng role từ backend
    if (normalizedRole.includes("admin")) {
      redirectPath = "/admin/dashboard";
    } else if (normalizedRole === "dealer_staff" || normalizedRole === "dealer-staff") {
      redirectPath = "/dealer-staff/customers";
    } else if (normalizedRole === "dealer_manager" || normalizedRole === "dealer") {
      redirectPath = "/dealer/dashboard";
    } else if (normalizedRole.includes("evm_staff") || normalizedRole.includes("evm-staff")) {
      redirectPath = "/evm-staff/dashboard";
    }

    console.log("➡️ Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, show the login page
  return children;
};

// FIX: Export default đúng cách
export default PublicRoute;
