// src/router/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // hoặc useAuth hook

export default function PublicRoute({ children }) {
  const { user } = useAuth(); // nếu user tồn tại => redirect

  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}
