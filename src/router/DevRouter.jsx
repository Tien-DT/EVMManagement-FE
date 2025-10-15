// src/router/DevRouter.jsx
// ROUTER ĐỂ TEST - KHÔNG CÓ PHÂN QUYỀN
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import DealerLayout from '../layouts/DealerLayout';

// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import ProfilePage from "../features/auth/pages/ProfilePage";

// Auth Pages
import SignUpForm from "../features/auth/components/SignUpForm";

const DevRouter = () => (
  <Router>
    <Routes>
      {/* Signup removed from public routes in dev router */}

      {/* Admin Routes - KHÔNG CÓ PHÂN QUYỀN */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/register" element={<SignUpForm />} />
      </Route>

      {/* Redirects & Fallbacks */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  </Router>
);

export default DevRouter;