// src/router/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import SignUpPage from "../features/auth/pages/SignUpPage";

// import pages theo cấu trúc features

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Public */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        }
      />
    </Routes>
  </Router>
);

export default AppRouter;
