import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { useAuth } from "../context/AuthContext";
import { authService } from "../features/auth/services/authService";
import EvmStaffSidebar from "./sidebar/EVMStaffSidebar";

const EvmStaffLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Try to call logout API
      await authService.logout();

      navigate("/login");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    } finally {
      // Always clear local state and redirect
      logout();
      navigate("/login", { replace: true });
    }
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "user-info",
        label: (
          <div className="px-2 py-1">
            <div className="text-sm font-medium text-gray-800">
              {user?.fullName || "User"}
            </div>
            <div className="text-xs text-gray-500">{user?.email || ""}</div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profile",
        label: "Profile",
        onClick: () => navigate("/evm-staff/profile"),
      },
      {
        key: "logout",
        label: <span className="text-red-600">Logout</span>,
        onClick: handleLogout,
      },
    ],
    [navigate, user]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <EvmStaffSidebar />

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                EVM Staff Portal
              </h1>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
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
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EvmStaffLayout;
