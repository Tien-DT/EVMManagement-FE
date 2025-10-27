// src/api/endpoints.js
const endpoints = {
  contracts: {
    getAll: "/v1/Contracts",
    getById: (id) => `/v1/Contracts/${id}`,
    create: "/v1/Contracts",
    update: (id) => `/v1/Contracts/${id}`,
    delete: (id) => `/v1/Contracts/${id}`,
  },
  deposits: {
    getAll: "/v1/Deposits",
    getById: (id) => `/v1/Deposits/${id}`,
    create: "/v1/Deposits",
    update: (id) => `/v1/Deposits/${id}`,
    delete: (id) => `/v1/Deposits/${id}`,
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
    getByDealer: (dealerId) => `/v1/Quotations/dealer/${dealerId}`, // Alias
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
    filter: "/v1/Orders/filter",
    getById: (id) => `/v1/Orders/${id}`,
    getByIdWithDetails: (id) => `/v1/Orders/${id}/with-details`,
    getByDealer: (dealerId) => `/v1/Orders/dealer/${dealerId}`,
    create: "/v1/Orders",
    createWithDetails: "/v1/Orders/with-details",
    update: (id) => `/v1/Orders/${id}`,
    delete: (id) => `/v1/Orders/${id}`,
    createPreOrderDeposit: (orderId) => `/v1/Orders/${orderId}/deposits/preorder`,
    confirmPayment: (orderId) => `/v1/Orders/${orderId}/confirm-payment`,
  },
  
  // Order Details endpoints (kept for future use)
  orderDetails: {
    getAll: "/v1/OrderDetails",
    getById: (id) => `/v1/OrderDetails/${id}`,
    create: "/v1/OrderDetails",
    update: (id) => `/v1/OrderDetails/${id}`,
    delete: (id) => `/v1/OrderDetails/${id}`,
  },
  
  // Handover Records endpoints
  handoverRecords: {
    getAll: "/v1/HandoverRecords",
    getById: (id) => `/v1/HandoverRecords/${id}`,
    create: "/v1/HandoverRecords",
    update: (id) => `/v1/HandoverRecords/${id}`,
    delete: (id) => `/v1/HandoverRecords/${id}`,
  },
  
  vehicleModels: {
    getAll: "/v1/VehicleModels",
    getById: (id) => `/v1/VehicleModels/${id}`,
    getByDealer: (dealerId) => `/v1/VehicleModels/dealer/${dealerId}/models`,
    getAllWithStock: (dealerId) => `/v1/VehicleModels/with-stock?dealerId=${dealerId}`,
    create: "/v1/VehicleModels",
    update: (id) => `/v1/VehicleModels/${id}`,
    delete: (id) => `/v1/VehicleModels/${id}`,
  },
  
  vehicleVariants: {
    getAll: "/v1/VehicleVariants",
    getById: (id) => `/v1/VehicleVariants/${id}`,
    getByModel: (modelId) => `/v1/VehicleVariants/by-model/${modelId}`,
    getByDealerAndModel: (dealerId, modelId) => `/v1/VehicleVariants/dealer/${dealerId}/models/${modelId}/variants`,
    getByDealerAndModelWithStock: (dealerId, modelId) => `/v1/VehicleVariants/dealer/${dealerId}/models/${modelId}/variants-with-stock`,
    create: "/v1/VehicleVariants",
    update: (id) => `/v1/VehicleVariants/${id}`,
    delete: (id) => `/v1/VehicleVariants/${id}`,
  },

  vehicles: {
    getAll: "/v1/Vehicles",
    getById: (id) => `/v1/Vehicles/${id}`,
    getByDealerAndVariant: (dealerId, variantId) => `/v1/Vehicles/dealer/${dealerId}/variant/${variantId}`,
    create: "/v1/Vehicles",
    update: (id) => `/v1/Vehicles/${id}`,
    delete: (id) => `/v1/Vehicles/${id}`,
  },
};

export default endpoints;