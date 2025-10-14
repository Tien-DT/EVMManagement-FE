// src/api/endpoints.js
const endpoints = {
  auth: {
    signup: "v1/Auth/accounts",
    login: "/v1/Auth/login",
    me: "/auth/me",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
  },
  // thêm các nhóm endpoint khác ở đây
};

export default endpoints;
