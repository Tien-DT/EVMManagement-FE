// src/router/AppRouter.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import DealerLayout from "../layouts/DealerLayout";

// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import SignUpForm from "../features/auth/components/SignUpForm";
import DealerListPage from "../features/dealer/pages/DealerListPage";
import DealerFormPage from "../features/dealer/pages/DealerFormPage";

// Auth Pages
import LoginPage from "../features/auth/pages/LoginPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Admin Routes - ✅ Support EVM_ADMIN role */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/register" element={<SignUpForm />} />
            <Route path="/admin/dealers" element={<DealerListPage />} />
            <Route path="/admin/dealers/new" element={<DealerFormPage />} />
            <Route path="/admin/dealers/:id/edit" element={<DealerFormPage />} />
          </Route>
        </Route>
      </Route>

      {/* Dealer Routes - nếu cần */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["dealer"]} />}>
          <Route element={<DealerLayout />}>
            {/* Add dealer routes here */}
            <Route
              path="/dealer/dashboard"
              element={<div>Dealer Dashboard</div>}
            />
          </Route>
        </Route>
      </Route>

      {/* ✅ FIX: Root redirect về login, KHÔNG loop */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;
