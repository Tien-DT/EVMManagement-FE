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
import DealerManagerLayout from "../layouts/DealerManagerLayout";

// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import SignUpForm from "../features/auth/components/SignUpForm";

// Auth Pages
import LoginPage from "../features/auth/pages/LoginPage";
import ProfilePage from "../features/auth/pages/ProfilePage";

// Dealer Manager Pages
import DealerManagerDashboardPage from "../features/dealer-manager/pages/DashboardPage";
import WarehousesPage from "../features/dealer-manager/pages/WarehousesPage";
import CreateWarehousePage from "../features/dealer-manager/pages/CreateWarehousePage";
import RegisterStaffPage from "../features/dealer-manager/pages/RegisterStaffPage";

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

      {/* Admin Routes - ✅ Support EVM_ADMIN role */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/register" element={<SignUpForm />} />
          </Route>
        </Route>
      </Route>

      {/* Dealer Manager Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["dealer"]} />}>
          <Route element={<DealerManagerLayout />}>
            <Route path="/dealer/dashboard" element={<DealerManagerDashboardPage />} />
            <Route path="/dealer/warehouses" element={<WarehousesPage />} />
            <Route path="/dealer/warehouses/create" element={<CreateWarehousePage />} />
            <Route path="/dealer/register-staff" element={<RegisterStaffPage />} />
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
