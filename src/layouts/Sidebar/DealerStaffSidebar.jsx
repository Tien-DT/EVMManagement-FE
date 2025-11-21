import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Car,
  Users,
  ShoppingBag,
  FileText,
  FileCheck,
  Menu,
  X,
  User,
  Calendar,
  GitCompare,
  Search,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import endpoints from "../../api/endpoints";

const DealerStaffSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        if (response.success && response.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const menuItems = [
    {
      path: "/dealer-staff/vehicles",
      icon: Car,
      label: "Xe",
      exact: true, // Only match exact path, not sub-routes
    },
    {
      path: "/dealer-staff/vehicles/compare",
      icon: GitCompare,
      label: "So sánh xe",
    },
    {
      path: "/dealer-staff/customers",
      icon: Users,
      label: "Khách hàng",
    },
    {
      path: "/dealer-staff/orders",
      icon: ShoppingBag,
      label: "Đơn hàng",
    },
    {
      path: "/dealer-staff/quotations",
      icon: FileText,
      label: "Báo giá",
    },
    {
      path: "/dealer-staff/contracts",
      icon: FileCheck,
      label: "Hợp đồng",
    },
    {
      path: "/dealer-staff/test-drive-bookings",
      icon: Calendar,
      label: "Đặt chỗ lái thử",
    },
    {
      path: "/dealer-staff/customer-booking-search",
      icon: Search,
      label: "Tra cứu lịch đặt",
    },
    {
      path: "/dealer-staff/chat",
      icon: MessageCircle,
      label: "Trợ lý ảo",
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white
          text-gray-800 transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:fixed
          w-64 shadow-lg overflow-x-hidden border-r border-gray-200
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Dealer System</h2>
              <p className="text-xs text-gray-500">Staff Portal</p>
            </div>
          </div>

          {/* User Greeting */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <User size={16} className="text-gray-600" />
              <p className="text-xs text-gray-600 font-medium">Xin chào,</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.fullName ||
                  user?.fullName ||
                  user?.username ||
                  "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menu Chính
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon
                  size={20}
                  className={
                    active
                      ? "text-emerald-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }
                />
                <span
                  className={`font-medium flex-1 ${
                    active ? "text-emerald-700" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default DealerStaffSidebar;
