// src/router/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Import từ AuthContext

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If user is authenticated, redirect based on role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'dealer-manager':
      case 'dealer-staff':
        return <Navigate to="/dealer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
}