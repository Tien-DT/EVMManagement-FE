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
import DealerStaffLayout from "../layouts/DealerStaffLayout";
import EVMStaffLayout from "../layouts/EvmStaffLayout"; 

// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import SignUpForm from "../features/auth/components/SignUpForm";

// Dealer Pages
import DealerListPage from "../features/dealer/pages/DealerListPage";
import DealerFormPage from "../features/dealer/pages/DealerFormPage";

// Vehicle Pages
import VehicleListPage from "../features/vehicle/pages/VehicleListPage";
import VehicleFormPage from "../features/vehicle/pages/VehicleFormPage";
import VehicleModelDetailPage from "../features/vehicle/pages/VehicleModelDetailPage";
import VehicleVariantFormPage from "../features/vehicle/pages/VehicleVariantFormPage";

// Promotion Pages
import PromotionListPage from "../features/promotion/pages/PromotionListPage";
import PromotionFormPage from "../features/promotion/pages/PromotionFormPage";

// Auth Pages
import LoginPage from "../features/auth/pages/LoginPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UserProfileTestPage from "../features/auth/pages/UserProfileTestPage";

// Dealer Manager Pages
import DealerManagerDashboardPage from "../features/dealer-manager/pages/DealerManagerDashboardPage";
import WarehousesPage from "../features/dealer-manager/pages/WarehousesPage";
import CreateWarehousePage from "../features/dealer-manager/pages/CreateWarehousePage";
import RegisterStaffPage from "../features/dealer-manager/pages/RegisterStaffPage";

// Dealer Staff Pages
import CustomersPage from "../features/dealer-staff/pages/CustomersPage";
import CreateCustomerPage from "../features/dealer-staff/pages/CreateCustomerPage";
import QuotationsPage from "../features/dealer-staff/pages/QuotationsPage";
import CreateQuotationPage from "../features/dealer-staff/pages/CreateQuotationPage";

// EVM Staff Pages
import EvmStaffDashboardPage from "../features/evm-staff/pages/EvmStaffDashboardPage";
import EvmStaffOrderRequestsPage from "../features/evm-staff/pages/EvmStaffOrderRequestsPage";
import EvmStaffCreateQuotationPage from "../features/evm-staff/pages/EvmStaffCreateQuotationPage";
import EvmStaffContractsPage from "../features/evm-staff/pages/EvmStaffContractsPage";
import EvmStaffCreateDealerContractPage from "../features/evm-staff/pages/EvmStaffCreateDealerContractPage";
import EvmStaffVehiclesPage from "../features/evm-staff/pages/EvmStaffVehiclesPage";
import EvmStaffOrdersPage from "../features/evm-staff/pages/EvmStaffOrdersPage";
import EvmStaffCustomersPage from "../features/evm-staff/pages/EvmStaffCustomersPage";

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
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
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
            <Route path="/admin/vehiclemodels" element={<VehicleListPage />} />
            <Route path="/admin/vehiclemodels/new" element={<VehicleFormPage />} />
            <Route path="/admin/vehiclemodels/:id/edit" element={<VehicleFormPage />} />
            <Route path="/admin/vehiclemodels/:id" element={<VehicleModelDetailPage />} />
            <Route path="/admin/vehiclemodels/:id/variants/new" element={<VehicleVariantFormPage />} />
            <Route path="/admin/vehiclemodels/:id/variants/:variantId/edit" element={<VehicleVariantFormPage />} />
            <Route path="/admin/promotions" element={<PromotionListPage />} />
            <Route path="/admin/promotions/new" element={<PromotionFormPage />} />
            <Route path="/admin/promotions/:id/edit" element={<PromotionFormPage />} />
            <Route path="/admin/user-profile-test" element={<UserProfileTestPage />} />
          </Route>
        </Route>
      </Route>

      {/* Dealer Manager Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["dealer"]} />}>
          <Route element={<DealerManagerLayout />}>
            <Route
              path="/dealer/dashboard"
              element={<DealerManagerDashboardPage />}
            />
            <Route path="/dealer/warehouses" element={<WarehousesPage />} />
            <Route
              path="/dealer/warehouses/create"
              element={<CreateWarehousePage />}
            />
            <Route
              path="/dealer/register-staff"
              element={<RegisterStaffPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Dealer Staff Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["dealer-staff"]} />}>
          <Route element={<DealerStaffLayout />}>
            <Route path="/dealer-staff/customers" element={<CustomersPage />} />
            <Route
              path="/dealer-staff/customers/create"
              element={<CreateCustomerPage />}
            />
            <Route
              path="/dealer-staff/customers/create"
              element={<CreateCustomerPage />}
            />
            <Route
              path="/dealer-staff/quotations"
              element={<QuotationsPage />}
            />
            <Route
              path="/dealer-staff/quotations/create"
              element={<CreateQuotationPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* EVM Staff Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["evm-staff"]} />}>
          <Route element={<EVMStaffLayout />}>
            <Route path="/evm-staff/dashboard" element={<EvmStaffDashboardPage />} />
            <Route path="/evm-staff/order-requests" element={<EvmStaffOrderRequestsPage />} />
            <Route path="/evm-staff/quotations" element={<QuotationsPage />} />
            <Route path="/evm-staff/quotations/create/:requestId" element={<EvmStaffCreateQuotationPage />} />
            <Route path="/evm-staff/contracts" element={<EvmStaffContractsPage />} />
            <Route path="/evm-staff/contracts/create" element={<EvmStaffCreateDealerContractPage />} />
            <Route path="/evm-staff/vehicles" element={<EvmStaffVehiclesPage />} />
            <Route path="/evm-staff/orders" element={<EvmStaffOrdersPage />} />
            <Route path="/evm-staff/customers" element={<EvmStaffCustomersPage />} />
            <Route path="/evm-staff/profile" element={<ProfilePage />} />
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
