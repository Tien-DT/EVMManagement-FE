// src/api/endpoints.js
const endpoints = {
  contracts: {
    getAll: "/v1/Contracts",
    getById: (id) => `/v1/Contracts/${id}`,
    getByDealer: (dealerId) => `/v1/Contracts/by-dealer/${dealerId}`,
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
    evmStaff: "/v1/UserProfile",
    vehicleModels: "/v1/VehicleModels",
    vehicleVariants: "/v1/VehicleVariants",
    promotions: "/v1/Promotions",
    warehouses: "/v1/Warehouses",
    warehousesById: (id) => `/v1/Warehouses/${id}`,
    warehousesByDealer: (dealerId) => `/v1/Warehouses/dealer/${dealerId}`,
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
    filter: "/v1/Orders/filter",
    getById: (id) => `/v1/Orders/${id}`,
    getByIdWithDetails: (id) => `/v1/Orders/${id}/with-details`,
    getWithDetails: (id) => `/v1/Orders/${id}/with-details`, // Alias for getByIdWithDetails
    getByDealer: (dealerId) => `/v1/Orders/dealer/${dealerId}`,
    create: "/v1/Orders",
    createWithDetails: "/v1/Orders/with-details",
    update: (id) => `/v1/Orders/${id}`,
    delete: (id) => `/v1/Orders/${id}`,
    // Deposit preorder (Dealer Manager)
    createDepositPreorder: (orderId) => `/v1/Orders/${orderId}/deposits/preorder`,
    createPreOrderDeposit: (orderId) => `/v1/Orders/${orderId}/deposits/preorder`,
    // Approval workflow (EVM Staff & Dealer Manager)
    requestApproval: (orderId) => `/v1/Orders/${orderId}/request-approval`,
    approveByManager: (orderId) => `/v1/Orders/${orderId}/approve-by-manager`,
    // Notification (EVM Staff)
    notifyCustomer: (orderId) => `/v1/Orders/${orderId}/notify-customer`,
    // Customer confirmation (Order Inspection - Dealer Manager)
    customerConfirmation: (orderId) => `/v1/Orders/${orderId}/customer-confirmation`,
    // Payment confirmation (Dealer Manager)
    confirmPayment: (orderId) => `/v1/Orders/${orderId}/confirm-payment`,
    // Handover (EVM Staff - Deliver order)
    handover: (orderId) => `/v1/Orders/${orderId}/handover`,
  },
  
  // Order Details endpoints (kept for future use)
  orderDetails: {
    getAll: "/v1/OrderDetails",
    getById: (id) => `/v1/OrderDetails/${id}`,
    create: "/v1/OrderDetails",
    update: (id) => `/v1/OrderDetails/${id}`,
    delete: (id) => `/v1/OrderDetails/${id}`,
  },

  // Master Time Slots endpoints
  masterTimeSlots: {
    getAll: "/v1/MasterTimeSlots",
    getById: (id) => `/v1/MasterTimeSlots/${id}`,
    getByDealer: (dealerId) => `/v1/MasterTimeSlots/dealer/${dealerId}`,
    create: "/v1/MasterTimeSlots",
    update: (id) => `/v1/MasterTimeSlots/${id}`,
    updateIsActive: (id) => `/v1/MasterTimeSlots/${id}/is-active`,
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
  },
  
  // Handover Records endpoints
  handoverRecords: {
    getAll: "/v1/HandoverRecords",
    getById: (id) => `/v1/HandoverRecords/${id}`,
    create: "/v1/HandoverRecords",
    update: (id) => `/v1/HandoverRecords/${id}`,
    delete: (id) => `/v1/HandoverRecords/${id}`,
  },

  // Digital Signatures endpoints
  digitalSignatures: {
    requestOtp: "/v1/DigitalSignatures/request-otp",
    verifyOtp: "/v1/DigitalSignatures/verify-otp",
    complete: "/v1/DigitalSignatures/complete",
    getById: (id) => `/v1/DigitalSignatures/${id}`,
    getByContract: (contractId) => `/v1/DigitalSignatures/contracts/${contractId}`,
    getByHandoverRecord: (recordId) => `/v1/DigitalSignatures/handover-records/${recordId}`,
    getByDealerContract: (dealerContractId) => `/v1/DigitalSignatures/dealer-contracts/${dealerContractId}`,
  },

  // Deposits endpoints
  deposits: {
    getAll: "/v1/Deposits",
    getById: (id) => `/v1/Deposits/${id}`,
    create: "/v1/Deposits",
    update: (id) => `/v1/Deposits/${id}`,
    delete: (id) => `/v1/Deposits/${id}`,
    getByOrder: (orderId) => `/v1/Deposits?orderId=${orderId}`,
  },

  // Reports endpoints
  reports: {
    getAll: "/v1/Reports",
    getById: (id) => `/v1/Reports/${id}`,
    create: "/v1/Reports",
    update: (id) => `/v1/Reports/${id}`,
    delete: (id) => `/v1/Reports/${id}`,
    getByDealer: (dealerId) => `/v1/Reports?dealerId=${dealerId}`,
    getByOrder: (orderId) => `/v1/Reports?orderId=${orderId}`,
  },

  // Vehicle Models endpoints
  vehicleModels: {
    getAll: "/v1/VehicleModels",
    getById: (id) => `/v1/VehicleModels/${id}`,
    getByDealer: (dealerId) => `/v1/VehicleModels/dealer/${dealerId}/models`,
    getAllWithStock: (dealerId) => `/v1/VehicleModels/with-stock?dealerId=${dealerId}`,
    create: "/v1/VehicleModels",
    update: (id) => `/v1/VehicleModels/${id}`,
    delete: (id) => `/v1/VehicleModels/${id}`,
  },
  
  // Vehicle Variants endpoints
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

  // Vehicles endpoints
  vehicles: {
    getAll: "/v1/Vehicles",
    getById: (id) => `/v1/Vehicles/${id}`,
    getByDealerAndVariant: (dealerId, variantId) => `/v1/Vehicles/dealer/${dealerId}/variant/${variantId}`,
    create: "/v1/Vehicles",
    update: (id) => `/v1/Vehicles/${id}`,
    delete: (id) => `/v1/Vehicles/${id}`,
  },

  // Payments endpoints (VNPAY Integration)
  payments: {
    vnpayCreate: "/v1/Payments/vnpay/create",
    vnpayCallback: "/v1/Payments/vnpay/callback",
    vnpayReturn: "/v1/Payments/vnpay/return",
  },

  // Transport endpoints
  transports: {
    getAll: "/v1/Transports",
    getByDealer: (dealerId) => `/v1/Transports/dealer/${dealerId}`,
    getById: (id) => `/v1/Transports/${id}`,
    create: "/v1/Transports",
    update: (id) => `/v1/Transports/${id}`,
    delete: (id) => `/v1/Transports/${id}`,
  },

  // Transport Details endpoints
  transportDetails: {
    create: "/v1/TransportDetails",
    getByTransport: (transportId) => `/v1/TransportDetails/transport/${transportId}`,
    update: (id) => `/v1/TransportDetails/${id}`,
    delete: (id) => `/v1/TransportDetails/${id}`,
  },

  // Warehouse endpoints
  warehouses: {
    getAll: "/v1/Warehouses",
    getById: (id) => `/v1/Warehouses/${id}`,
    getByDealer: (dealerId) => `/v1/Warehouses/dealer/${dealerId}`,
    create: "/v1/Warehouses",
    update: (id) => `/v1/Warehouses/${id}`,
    delete: (id) => `/v1/Warehouses/${id}`,
    // EVM Warehouse endpoints
    evm: {
      getAll: (organization = "EVM") => `/v1/Warehouses?organization=${organization}`,
      addVehicles: "/v1/Warehouses/evm/add-vehicles",
    },
    // Dealer Warehouse endpoints
    dealer: {
      addVehicles: "/v1/Warehouses/dealer/add-vehicles",
    },
  },
};

export default endpoints;
