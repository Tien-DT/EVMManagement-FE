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
import EvmStaffLayout from "../layouts/EVMStaffLayout";

// Admin Pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import SignUpForm from "../features/auth/components/SignUpForm";
import RegisterDealerManagerPage from "../features/admin/pages/RegisterDealerManagerPage";
import EvmStaffListPage from "../features/admin/pages/EvmStaffListPage";
import EvmStaffFormPage from "../features/admin/pages/EvmStaffFormPage";
import EvmStaffDetailPage from "../features/admin/pages/EvmStaffDetailPage";
import DealerContractsListPage from "../features/admin/pages/contracts/DealerContractsListPage";
import CreateDealerContractPage from "../features/admin/pages/contracts/CreateDealerContractPage";
import AdminDealerContractDetailPage from "../features/admin/pages/contracts/DealerContractDetailPage";
import AdminWarehousesPage from "../features/admin/pages/WarehousesPage";
import AdminCreateWarehousePage from "../features/admin/pages/CreateWarehousePage";
import AdminWarehouseDetailPage from "../features/admin/pages/WarehouseDetailPage";
import AdminEditWarehousePage from "../features/admin/pages/EditWarehousePage";
import AdminWarehousesPage from "../features/admin/pages/AdminWarehousesPage";

// Dealer Pages
import DealerListPage from "../features/dealer/pages/DealerListPage";
import DealerFormPage from "../features/dealer/pages/DealerFormPage";
import DealerDetailPage from "../features/dealer/pages/DealerDetailPage";

// Vehicle Pages
import VehicleListPage from "../features/vehicle/pages/VehicleListPage";
import VehicleFormPage from "../features/vehicle/pages/VehicleFormPage";
import VehicleModelDetailPage from "../features/vehicle/pages/VehicleModelDetailPage";
import VehicleVariantFormPage from "../features/vehicle/pages/VehicleVariantFormPage";
import VehicleVariantDetailPage from "../features/vehicle/pages/VehicleVariantDetailPage";

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
import DealerManagerOrdersPage from "../features/dealer-manager/pages/DealerManagerOrdersPage";
import DealerManagerQuotationsPage from "../features/dealer-manager/pages/DealerManagerQuotationsPage";
import DealerManagerQuotationDetailPage from "../features/dealer-manager/pages/DealerManagerQuotationDetailPage";
import DealerManagerCreateContractPage from "../features/dealer-manager/pages/CreateContractPage";
import DealerManagerContractsPage from "../features/dealer-manager/pages/DealerManagerContractsPage";
import DealerManagerDepositsPage from "../features/dealer-manager/pages/DealerManagerDepositsPage";
import WarehousesPage from "../features/dealer-manager/pages/WarehousesPage";
import CreateWarehousePage from "../features/dealer-manager/pages/CreateWarehousePage";
import TransportPage from "../features/dealer-manager/pages/TransportPage";
import RegisterStaffPage from "../features/dealer-manager/pages/RegisterStaffPage";
import DealerManagerVehicleModelsPage from "../features/dealer-manager/pages/DealerManagerVehicleModelsPage";
import DealerManagerVehicleVariantsPage from "../features/dealer-manager/pages/DealerManagerVehicleVariantsPage";
import DealerContractsPage from "../features/dealer-manager/pages/DealerContractsPage";
import DealerContractDetailPage from "../features/dealer-manager/pages/DealerContractDetailPage";
import ReportsPage from "../features/dealer-manager/pages/ReportsPage";
import CreateReportPage from "../features/dealer-manager/pages/CreateReportPage";
import ReportDetailPage from "../features/dealer-manager/pages/ReportDetailPage";
import DepositsPage from "../features/dealer-manager/pages/DepositsPage";
import CreateDepositPage from "../features/dealer-manager/pages/CreateDepositPage";
import DepositDetailPage from "../features/dealer-manager/pages/DepositDetailPage";

// Dealer Staff Pages
import CustomersPage from "../features/dealer-staff/pages/CustomersPage";
import CreateCustomerPage from "../features/dealer-staff/pages/CreateCustomerPage";
import CustomerDetailPage from "../features/dealer-staff/pages/CustomerDetailPage";
import DealerVehicleModelsPage from "../features/dealer-staff/pages/DealerVehicleModelsPage";
import DealerVehicleVariantsPage from "../features/dealer-staff/pages/DealerVehicleVariantsPage";
import QuotationsPage from "../features/dealer-staff/pages/QuotationsPage";
import CreateQuotationPage from "../features/dealer-staff/pages/CreateQuotationPage";
import QuotationDetailPage from "../features/dealer-staff/pages/QuotationDetailPage";
import OrdersPage from "../features/dealer-staff/pages/OrdersPage";
import CreateOrderPage from "../features/dealer-staff/pages/CreateOrderPage";
import OrderDetailPage from "../features/dealer-staff/pages/OrderDetailPage";

// Contract Pages
import ContractsPage from "../features/dealer-staff/pages/ContractsPage";
import CreateContractPage from "../features/dealer-staff/pages/CreateContractPage";
import ContractDetailPage from "../features/dealer-staff/pages/ContractDetailPage";

// EVM Staff Pages
import EvmStaffDashboardPage from "../features/evm-staff/pages/EvmStaffDashboardPage";
import EvmStaffOrderRequestsPage from "../features/evm-staff/pages/EvmStaffOrderRequestsPage";
import EvmStaffQuotationsPage from "../features/evm-staff/pages/EvmStaffQuotationsPage";
import EvmStaffCreateQuotationPage from "../features/evm-staff/pages/EvmStaffCreateQuotationPage";
import EvmStaffQuotationDetailPage from "../features/evm-staff/pages/EvmStaffQuotationDetailPage";
import EvmStaffVehiclesPage from "../features/evm-staff/pages/EvmStaffVehiclesPage";
import EvmStaffOrdersPage from "../features/evm-staff/pages/EvmStaffOrdersPage";
import EvmStaffOrderDetailPage from "../features/evm-staff/pages/EvmStaffOrderDetailPage";
import EvmStaffOrderFormPage from "../features/evm-staff/pages/EvmStaffOrderFormPage";
import EvmStaffCustomersPage from "../features/evm-staff/pages/EvmStaffCustomersPage";
import HandoverRecordsPage from "../features/evm-staff/pages/HandoverRecordsPage";
import CreateHandoverRecordPage from "../features/evm-staff/pages/CreateHandoverRecordPage";
import HandoverRecordDetailPage from "../features/evm-staff/pages/HandoverRecordDetailPage";
import EvmStaffTransportsPage from "../features/evm-staff/pages/EvmStaffTransportsPage";
import EvmStaffReportsPage from "../features/evm-staff/pages/ReportsPage";
import EvmStaffReportDetailPage from "../features/evm-staff/pages/ReportDetailPage";
import EvmStaffWarehousesPage from "../features/evm-staff/pages/WarehousesPage";
import EvmStaffCreateWarehousePage from "../features/evm-staff/pages/CreateWarehousePage";
import EvmStaffWarehouseDetailPage from "../features/evm-staff/pages/WarehouseDetailPage";
import EvmStaffEditWarehousePage from "../features/evm-staff/pages/EditWarehousePage";

// Payment Pages
import VNPayReturnPage from "../pages/VNPayReturnPage";

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

      {/* Payment Return Routes - Public */}
      <Route path="/payment/vnpay-return" element={<VNPayReturnPage />} />

      {/* Admin Routes - ✅ Support EVM_ADMIN role */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/register" element={<SignUpForm />} />
            <Route
              path="/admin/register-dealer-manager"
              element={<RegisterDealerManagerPage />}
            />
            <Route path="/admin/warehouses" element={<AdminWarehousesPage />} />
            <Route path="/admin/dealers" element={<DealerListPage />} />
            <Route path="/admin/dealers/new" element={<DealerFormPage />} />
            <Route path="/admin/dealers/:id" element={<DealerDetailPage />} />
            <Route
              path="/admin/dealers/:id/edit"
              element={<DealerFormPage />}
            />
            <Route path="/admin/evm-staff" element={<EvmStaffListPage />} />
            <Route path="/admin/evm-staff/new" element={<EvmStaffFormPage />} />
            <Route
              path="/admin/evm-staff/:id"
              element={<EvmStaffDetailPage />}
            />
            <Route
              path="/admin/evm-staff/:id/edit"
              element={<EvmStaffFormPage />}
            />
            <Route path="/admin/vehiclemodels" element={<VehicleListPage />} />
            <Route
              path="/admin/vehiclemodels/new"
              element={<VehicleFormPage />}
            />
            <Route
              path="/admin/vehiclemodels/:id/edit"
              element={<VehicleFormPage />}
            />
            <Route
              path="/admin/vehiclemodels/:id"
              element={<VehicleModelDetailPage />}
            />
            <Route
              path="/admin/vehiclemodels/:id/variants/new"
              element={<VehicleVariantFormPage />}
            />
            <Route
              path="/admin/vehiclemodels/:id/variants/:variantId"
              element={<VehicleVariantDetailPage />}
            />
            <Route
              path="/admin/vehiclemodels/:id/variants/:variantId/edit"
              element={<VehicleVariantFormPage />}
            />
            <Route path="/admin/promotions" element={<PromotionListPage />} />
            <Route
              path="/admin/promotions/new"
              element={<PromotionFormPage />}
            />
            <Route
              path="/admin/promotions/:id/edit"
              element={<PromotionFormPage />}
            />
            <Route
              path="/admin/user-profile-test"
              element={<UserProfileTestPage />}
            />
            {/* Dealer Contracts Routes */}
            <Route
              path="/admin/dealer-contracts"
              element={<DealerContractsListPage />}
            />
            <Route
              path="/admin/dealer-contracts/create"
              element={<CreateDealerContractPage />}
            />
            <Route
              path="/admin/dealer-contracts/:id"
              element={<AdminDealerContractDetailPage />}
            />
            {/* Warehouse Routes */}
            <Route path="/admin/warehouses" element={<AdminWarehousesPage />} />
            <Route
              path="/admin/warehouses/create"
              element={<AdminCreateWarehousePage />}
            />
            <Route
              path="/admin/warehouses/:id"
              element={<AdminWarehouseDetailPage />}
            />
            <Route
              path="/admin/warehouses/:id/edit"
              element={<AdminEditWarehousePage />}
            />
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
            {/* Orders Management */}
            <Route
              path="/dealer/orders"
              element={<DealerManagerOrdersPage />}
            />

            {/* Quotations Management */}
            <Route
              path="/dealer/quotations"
              element={<DealerManagerQuotationsPage />}
            />
            <Route
              path="/dealer/quotations/:id"
              element={<DealerManagerQuotationDetailPage />}
            />

            {/* Transport Management */}
            <Route path="/dealer/transports" element={<TransportPage />} />

            {/* Contracts Management */}
            <Route
              path="/dealer/contracts"
              element={<DealerManagerContractsPage />}
            />

            {/* Deposits Management */}
            <Route
              path="/dealer/deposits"
              element={<DealerManagerDepositsPage />}
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

            {/* Vehicle Routes for B2B Orders */}
            <Route
              path="/dealer/vehicles"
              element={<DealerManagerVehicleModelsPage />}
            />
            <Route
              path="/dealer/vehicles/:modelId/variants"
              element={<DealerManagerVehicleVariantsPage />}
            />

            {/* Contract Routes */}
            <Route
              path="/dealer/contracts/create"
              element={<DealerManagerCreateContractPage />}
            />

            {/* Dealer Manager Contract Routes */}
            <Route
              path="/dealer-manager/contracts"
              element={<DealerContractsPage />}
            />
            <Route
              path="/dealer-manager/contracts/:id"
              element={<DealerContractDetailPage />}
            />

            {/* Dealer Manager Report Routes */}
            <Route path="/dealer-manager/reports" element={<ReportsPage />} />
            <Route
              path="/dealer-manager/reports/create"
              element={<CreateReportPage />}
            />
            <Route
              path="/dealer-manager/reports/:id"
              element={<ReportDetailPage />}
            />

            {/* Dealer Manager Deposit Routes */}
            <Route path="/dealer-manager/deposits" element={<DepositsPage />} />
            <Route
              path="/dealer-manager/deposits/create"
              element={<CreateDepositPage />}
            />
            <Route
              path="/dealer-manager/deposits/:id"
              element={<DepositDetailPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Dealer Staff Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["dealer-staff"]} />}>
          <Route element={<DealerStaffLayout />}>
            {/* Vehicle Routes */}
            <Route
              path="/dealer-staff/vehicles"
              element={<DealerVehicleModelsPage />}
            />
            <Route
              path="/dealer-staff/vehicles/:modelId/variants"
              element={<DealerVehicleVariantsPage />}
            />

            {/* Customer Routes */}
            <Route path="/dealer-staff/customers" element={<CustomersPage />} />
            <Route
              path="/dealer-staff/customers/create"
              element={<CreateCustomerPage />}
            />
            <Route
              path="/dealer-staff/customers/:id"
              element={<CustomerDetailPage />}
            />

            {/* Quotation Routes */}
            <Route
              path="/dealer-staff/quotations"
              element={<QuotationsPage />}
            />
            <Route
              path="/dealer-staff/quotations/create"
              element={<CreateQuotationPage />}
            />
            <Route
              path="/dealer-staff/quotations/:id"
              element={<QuotationDetailPage />}
            />

            {/* Order Routes */}
            <Route path="/dealer-staff/orders" element={<OrdersPage />} />
            <Route
              path="/dealer-staff/orders/create"
              element={<CreateOrderPage />}
            />
            <Route
              path="/dealer-staff/orders/:id"
              element={<OrderDetailPage />}
            />

            {/* Contract Routes */}
            <Route path="/dealer-staff/contracts" element={<ContractsPage />} />
            <Route
              path="/dealer-staff/contracts/create"
              element={<CreateContractPage />}
            />
            <Route
              path="/dealer-staff/contracts/:id"
              element={<ContractDetailPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* EVM Staff Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["evm-staff"]} />}>
          <Route element={<EvmStaffLayout />}>
            <Route
              path="/evm-staff/dashboard"
              element={<EvmStaffDashboardPage />}
            />
            <Route
              path="/evm-staff/order-requests"
              element={<EvmStaffOrderRequestsPage />}
            />

            {/* Quotation Routes */}
            <Route
              path="/evm-staff/quotations"
              element={<EvmStaffQuotationsPage />}
            />
            <Route
              path="/evm-staff/quotations/create"
              element={<EvmStaffCreateQuotationPage />}
            />
            <Route
              path="/evm-staff/quotations/create/:requestId"
              element={<EvmStaffCreateQuotationPage />}
            />
            <Route
              path="/evm-staff/quotations/edit/:id"
              element={<EvmStaffCreateQuotationPage />}
            />
            <Route
              path="/evm-staff/quotations/:id"
              element={<EvmStaffQuotationDetailPage />}
            />

            <Route
              path="/evm-staff/vehicles"
              element={<EvmStaffVehiclesPage />}
            />

            {/* Order Routes */}
            <Route path="/evm-staff/orders" element={<EvmStaffOrdersPage />} />
            <Route
              path="/evm-staff/orders/create"
              element={<EvmStaffOrderFormPage />}
            />
            <Route
              path="/evm-staff/orders/:id"
              element={<EvmStaffOrderDetailPage />}
            />
            <Route
              path="/evm-staff/orders/:id/edit"
              element={<EvmStaffOrderFormPage />}
            />

            <Route
              path="/evm-staff/customers"
              element={<EvmStaffCustomersPage />}
            />

            {/* Transport Routes */}
            <Route
              path="/evm-staff/transports"
              element={<EvmStaffTransportsPage />}
            />

            {/* Handover Records Routes */}
            <Route
              path="/evm-staff/handover-records"
              element={<HandoverRecordsPage />}
            />
            <Route
              path="/evm-staff/handover-records/create"
              element={<CreateHandoverRecordPage />}
            />
            <Route
              path="/evm-staff/handover-records/:id"
              element={<HandoverRecordDetailPage />}
            />
            <Route
              path="/evm-staff/handover-records/:id/edit"
              element={<HandoverRecordDetailPage />}
            />

            {/* Reports Routes */}
            <Route
              path="/evm-staff/reports"
              element={<EvmStaffReportsPage />}
            />
            <Route
              path="/evm-staff/reports/:id"
              element={<EvmStaffReportDetailPage />}
            />

            {/* Warehouse Routes */}
            <Route
              path="/evm-staff/warehouses"
              element={<EvmStaffWarehousesPage />}
            />
            <Route
              path="/evm-staff/warehouses/create"
              element={<EvmStaffCreateWarehousePage />}
            />
            <Route
              path="/evm-staff/warehouses/:id"
              element={<EvmStaffWarehouseDetailPage />}
            />
            <Route
              path="/evm-staff/warehouses/:id/edit"
              element={<EvmStaffEditWarehousePage />}
            />

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
