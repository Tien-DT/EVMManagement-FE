import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import DealerManagerSidebar from "./Sidebar/DealerManagerSidebar";
import { useAuth } from "../context/AuthContext";

const DealerManagerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "user-info",
        label: (
          <div className="px-2 py-1">
            <div className="text-sm font-medium text-gray-800">
              {user?.fullName || user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500">{user?.email || ""}</div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profile",
        label: "Hồ sơ",
        onClick: () => navigate("/dealer-manager/profile"),
      },
      {
        key: "logout",
        label: <span className="text-red-600">Đăng xuất</span>,
        onClick: handleLogout,
      },
    ],
    [navigate, user]
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DealerManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 relative">
                <span className="text-2xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className="flex items-center space-x-2 text-gray-700 cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">
                      {user?.fullName || user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Dealer Manager</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.fullName?.charAt(0) ||
                      user?.name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "D"}
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DealerManagerLayout;
