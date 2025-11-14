import React, { useMemo, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import DealerManagerSidebar from "./sidebar/DealerManagerSidebar";
import { useAuth } from "../context/AuthContext";
import ForceChangePasswordModal from "../features/auth/components/ForceChangePasswordModal";

const DealerManagerLayout = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [showForceChangePassword, setShowForceChangePassword] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check if dealer manager needs to change password
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase() || "";
      // Check if user is dealer manager (role can be "dealer_manager", "dealer", or similar)
      const isDealerManager =
        role === "dealer_manager" ||
        role === "dealer" ||
        (role.includes("dealer") && role.includes("manager"));

      if (isDealerManager) {
        // Check if password was already changed from multiple sources
        // 1. From user object (from login/context)
        // 2. From localStorage (local state)
        // 3. From userProfile in localStorage (backend data)
        const passwordChangedFromUser =
          user.isPasswordChanged ||
          user.passwordChangedAt ||
          user.password_changed_at;

        const passwordChangedFromLocalStorage =
          user.id &&
          localStorage.getItem(`password_changed_${user.id}`) === "true";

        // Get userProfile from localStorage to check passwordChangedAt from backend
        let passwordChangedFromBackend = false;
        try {
          const storedUserProfile = localStorage.getItem("userProfile");
          if (storedUserProfile) {
            const userProfile = JSON.parse(storedUserProfile);
            passwordChangedFromBackend = !!(
              userProfile.passwordChangedAt ||
              userProfile.password_changed_at ||
              userProfile.account?.passwordChangedAt ||
              userProfile.account?.password_changed_at
            );
          }
        } catch (e) {
          console.warn("Could not parse userProfile from localStorage:", e);
        }

        // Password is considered changed if any source indicates it
        const passwordChanged =
          passwordChangedFromUser ||
          passwordChangedFromLocalStorage ||
          passwordChangedFromBackend;

        // Check for mustChangePassword flag
        const mustChangePassword =
          user.mustChangePassword || user.must_change_password;

        // Check if user has skipped password change before
        const hasSkipped =
          user.passwordChangeSkipped ||
          (user.id &&
            localStorage.getItem(`password_change_skipped_${user.id}`) ===
              "true");

        // Show modal ONLY if:
        // 1. User is dealer manager
        // 2. Has mustChangePassword flag
        // 3. Hasn't skipped before
        // 4. Password NOT changed yet (first-time login)
        if (mustChangePassword && !hasSkipped && !passwordChanged) {
          console.log(
            "📋 Showing force change password modal for dealer manager (first-time login)"
          );
          setShowForceChangePassword(true);
        } else {
          console.log("🚫 Not showing force change password modal:", {
            mustChangePassword,
            hasSkipped,
            passwordChanged,
            passwordChangedFromUser,
            passwordChangedFromLocalStorage,
            passwordChangedFromBackend,
          });
        }
      }
    }
  }, [user]);

  const handleCloseForceChangePassword = () => {
    setShowForceChangePassword(false);
  };

  const handleSkipForceChangePassword = () => {
    // Mark as skipped
    if (user?.id) {
      localStorage.setItem(`password_change_skipped_${user.id}`, "true");
    }

    if (setUser && user) {
      setUser({
        ...user,
        passwordChangeSkipped: true,
        mustChangePassword: false, // Clear flag to prevent showing again
      });
    }

    setShowForceChangePassword(false);
  };

  const handlePasswordChanged = () => {
    // Password was changed successfully
    if (user?.id) {
      localStorage.setItem(`password_changed_${user.id}`, "true");
    }

    if (setUser && user) {
      setUser({
        ...user,
        mustChangePassword: false,
        isPasswordChanged: true,
      });
    }
    setShowForceChangePassword(false);
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

      {/* Force Change Password Modal for Dealer Manager */}
      <ForceChangePasswordModal
        isOpen={showForceChangePassword}
        onClose={handleCloseForceChangePassword}
        onSkip={handleSkipForceChangePassword}
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
};

export default DealerManagerLayout;
