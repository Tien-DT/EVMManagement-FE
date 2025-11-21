import React, { useMemo, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { useAuth } from "../context/AuthContext";
import { authService } from "../features/auth/services/authService";
import AdminSidebar from "./Sidebar/AdminSidebar";

const AdminLayout = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id || user?.fullName) {
        // Skip if no user ID or if fullName is already loaded
        return;
      }

      try {
        const response = await authService.getUserProfile(user.id);

        if (response.success && response.data) {
          // Update auth context with complete user data
          const updatedUser = {
            ...user,
            fullName: response.data.fullName,
            phone: response.data.phone,
            cardId: response.data.cardId,
            dealerId: response.data.dealerId,
            role: response.data.account?.role || user.role,
            isActive: response.data.account?.isActive,
          };
          setUser(updatedUser);
        }
      } catch (err) {
        console.error("Error fetching user profile in AdminLayout:", err);
        // Don't show error to user, just log it
      }
    };

    fetchUserProfile();
  }, [user?.id, user?.fullName, setUser]);

  const userInitial = useMemo(
    () => user?.fullName?.[0] || user?.name?.[0] || user?.email?.[0] || "👤",
    [user]
  );
  const displayName = useMemo(() => {
    // Prioritize fullName, then name, then email as fallback
    return user?.fullName || user?.name || user?.email || "Account";
  }, [user]);

  const menuItems = [
    {
      key: "profile",
      label: (
        <div className="px-2 py-1">
          <div className="text-sm font-medium text-slate-800">
            {displayName}
          </div>
          <div className="text-xs text-slate-500">{user?.email || ""}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: <span className="text-red-600">Logout</span>,
      onClick: () => {
        logout();
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-end">
            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* User Menu */}
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                open={open}
                onOpenChange={setOpen}
                placement="bottomRight"
              >
                <button className="flex items-center space-x-3 pl-3 pr-2 py-2 hover:bg-gray-50 rounded-lg transition-all">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {userInitial}
                  </div>
                </button>
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

export default AdminLayout;
