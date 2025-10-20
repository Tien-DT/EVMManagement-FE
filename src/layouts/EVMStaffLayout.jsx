// src/layouts/EVMStaffLayout.jsx
import React, { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { useAuth } from "../context/AuthContext";
import { authService } from "../features/auth/services/authService";
import EVMStaffSidebar from "./Sidebar/EVMStaffSidebar";

const EVMStaffLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        label: "Hồ sơ",
        onClick: () => navigate("/evm-staff/profile"),
      },
      {
        key: "logout",
        label: "Đăng xuất",
        onClick: handleLogout,
      },
    ],
    [navigate]
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <EVMStaffSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">
                EVM Staff Portal
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.fullName || user?.email || "User"}
                  </span>
                  <svg
                    className="w-4 h-4 ml-1 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EVMStaffLayout;