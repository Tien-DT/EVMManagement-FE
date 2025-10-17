// src/api/endpoints.js
const endpoints = {
  auth: {
    signup: "/v1/Auth/accounts",
    login: "/v1/Auth/login",
    refresh: "/v1/Auth/refresh",
    forgotPassword: "/v1/Auth/forgot-password",
    resetPassword: "/v1/Auth/reset-password",
  },
  // thêm các nhóm endpoint khác ở đây
  admin: {
    dashboard: "/v1/Admin/dashboard",
    users: "/v1/UserProfile",
    dealers: "/v1/Dealers",
    vehicles: "/v1/VehicleModels",
  },
  dealer: {
    vehicles: "/v1/Dealer/vehicles",
    orders: "/v1/Dealer/orders",
  },
};

export default endpoints;
