// src/api/endpoints.js
const endpoints = {
  auth: {
    signup: "/v1/Auth/accounts",
    login: "/v1/Auth/login",
    changePassword: "/v1/Auth/change-password",
    forgotPassword: "/v1/Auth/forgot-password",
    me: "/v1/Auth/me",
  },
  // thêm các nhóm endpoint khác ở đây
  admin: {
    dashboard: "/v1/Admin/dashboard",
    users: "/v1/Admin/users",
    vehicleModels: "/v1/VehicleModels",
  },
  dealer: {
    vehicles: "/v1/Dealer/vehicles",
    orders: "/v1/Dealer/orders",
  },
};

export default endpoints;
