// src/api/endpoints.js
const endpoints = {
  contracts: {
    getAll: "/v1/Contracts",
    getById: (id) => `/v1/Contracts/${id}`,
    create: "/v1/Contracts",
    update: (id) => `/v1/Contracts/${id}`,
    delete: (id) => `/v1/Contracts/${id}`,
  },
  dealerContracts: {
    getAll: "/v1/DealerContracts",
    getById: (id) => `/v1/DealerContracts/${id}`,
    getByDealer: (dealerId) => `/v1/DealerContracts/dealer/${dealerId}`,
    create: "/v1/DealerContracts",
    verifyOtp: (dealerId) => `/v1/DealerContracts/${dealerId}/verify-otp`,
  },
  auth: {
    signup: "/v1/Auth/accounts",
    login: "/v1/Auth/login",
    logout: "/v1/Auth/logout",
    refresh: "/v1/Auth/refresh",
    forgotPassword: "/v1/Auth/forgot-password",
    verifyOtp: "/v1/Auth/verify-otp",
    resetPassword: "/v1/Auth/reset-password",
    changePassword: "/v1/Auth/change-password",
  },

  admin: {
    dashboard: "/v1/Admin/dashboard",
    users: "/v1/UserProfile",
    dealers: "/v1/Dealers",
    vehicleModels: "/v1/VehicleModels",
    vehicleVariants: "/v1/VehicleVariants",
    promotions: "/v1/Promotions",
  },

  dealer: {
    vehicles: "/v1/Dealer/vehicles",
    orders: "/v1/Dealer/orders",
    warehouses: "/v1/Warehouses",
    warehousesByDealer: (dealerId) => `/v1/Warehouses/dealer/${dealerId}`,
    registerStaff: "/v1/Auth/register-dealer",
  },

  // User Profile endpoints
  userProfile: {
    getAll: "/v1/UserProfile",
    getById: (id) => `/v1/UserProfile/${id}`,
    getByAccount: (accId) => `/v1/UserProfile/by-account/${accId}`,
    getByRole: "/v1/UserProfile/by-role",
    getByDealer: (dealerId) => `/v1/UserProfile/by-dealer/${dealerId}`,
    update: (id) => `/v1/UserProfile/${id}`, // PATCH
    updateByAccount: (accId) => `/v1/UserProfile/${accId}`, // PUT
    byAccount: (accountId) => `/v1/UserProfile/by-account/${accountId}`, // Alias
  },

  // Customer endpoints
  customers: {
    getAll: "/v1/Customers",
    getById: (id) => `/v1/Customers/${id}`,
    getByDealer: (dealerId) => `/v1/Customers/dealer/${dealerId}`,
    create: "/v1/Customers",
    update: (id) => `/v1/Customers/${id}`,
    delete: (id) => `/v1/Customers/${id}`,
    search: "/v1/Customers/search",
  },

  // Quotation endpoints
  quotations: {
    getAll: "/v1/Quotations",
    getById: (id) => `/v1/Quotations/${id}`,
    getByDealerId: (dealerId) => `/v1/Quotations/dealer/${dealerId}`,
    getByDealer: (dealerId) => `/v1/Quotations/dealer/${dealerId}`,
    create: "/v1/Quotations",
    update: (id) => `/v1/Quotations/${id}`,
    delete: (id) => `/v1/Quotations/${id}`,
  },
  
  // Quotation Details endpoints
  quotationDetails: {
    getAll: "/v1/QuotationDetails",
    getById: (id) => `/v1/QuotationDetails/${id}`,
    getByQuotationId: (quotationId) => `/v1/QuotationDetails/quotation/${quotationId}`,
    create: "/v1/QuotationDetails",
    update: (id) => `/v1/QuotationDetails/${id}`,
    delete: (id) => `/v1/QuotationDetails/${id}`,
  },
  
  // Order endpoints
  orders: {
    getAll: "/v1/Orders",
    getById: (id) => `/v1/Orders/${id}`,
    getByDealer: (dealerId) => `/v1/Orders/dealer/${dealerId}`,
    create: "/v1/Orders",
    update: (id) => `/v1/Orders/${id}`,
    delete: (id) => `/v1/Orders/${id}`,
  },

  // Master Time Slots endpoints
  masterTimeSlots: {
    getAll: "/v1/MasterTimeSlots",
    getById: (id) => `/v1/MasterTimeSlots/${id}`,
    create: "/v1/MasterTimeSlots",
    update: (id) => `/v1/MasterTimeSlots/${id}`,
    delete: (id) => `/v1/MasterTimeSlots/${id}`,
  },

  // Test Drive Vehicles endpoints
  testDriveVehicles: {
    getAll: "/v1/TestDriveVehicles",
    getByDealer: (dealerId) => `/v1/TestDriveVehicles/dealer/${dealerId}`,
    create: "/v1/TestDriveVehicles",
    update: (id) => `/v1/TestDriveVehicles/${id}`,
    updateStatus: (id) => `/v1/TestDriveVehicles/${id}/status`,
    delete: (id) => `/v1/TestDriveVehicles/${id}`,
  },
  // Vehicle endpoints for dealer staff
  vehicles: {
    getModels: "/v1/VehicleModels",
    getVariantsByModel: (modelId) => `/v1/VehicleVariants/by-model/${modelId}`,
    getModelsByDealer: (dealerId) => `/v1/VehicleModels/dealer/${dealerId}/models`,
    getVariantsByDealerAndModel: (dealerId, modelId) => `/v1/VehicleVariants/dealer/${dealerId}/models/${modelId}/variants`,
    getVehiclesByDealerAndVariant: (dealerId, variantId) => `/v1/Vehicles/dealer/${dealerId}/variant/${variantId}`,
  
  // Handover Records endpoints
  handoverRecords: {
    getAll: "/v1/HandoverRecords",
    getById: (id) => `/v1/HandoverRecords/${id}`,
    create: "/v1/HandoverRecords",
    update: (id) => `/v1/HandoverRecords/${id}`,
    delete: (id) => `/v1/HandoverRecords/${id}`,
  },
};

export default endpoints;
