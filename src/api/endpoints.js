// src/api/endpoints.js
const endpoints = {
  auth: {
    signup: "/v1/Auth/accounts",
    login: "/v1/Auth/login",
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
    getByAccount: (accId) => `/v1/UserProfile/by-account/${accId}`,
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
    getByDealer: (dealerId) => `/v1/Quotations/dealer/${dealerId}`, // Alias
    create: "/v1/Quotations",
    update: (id) => `/v1/Quotations/${id}`,
    delete: (id) => `/v1/Quotations/${id}`,
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
};

export default endpoints;