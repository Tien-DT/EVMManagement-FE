// src/router/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoute";

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import DealerLayout from '../layouts/DealerLayout';


// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";

//Auth Pages
import SignUpPage from "../features/auth/pages/SignUpPage";
import LoginPage from "../features/auth/pages/LoginPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";



// import pages theo cấu trúc features

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpPage />
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

      {/* Admin Routes */}
      <Route element={<PrivateRoute />}>
        {/* <Route element={<RoleBasedRoute allowedRoles={['admin']} />}> */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            {/* Thêm các route admin khác ở đây */}
          </Route>
        {/* </Route> */}
      </Route>

    </Routes>
  </Router>
);

export default AppRouter;
