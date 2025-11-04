import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  UserPlus,
  Car,
  ShoppingBag,
  FileText,
  FileCheck,
  Truck,
  CreditCard,
  ChevronRight,
  Menu,
  X,
  User,
  BarChart3,
  Package,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../api/axiosInstance";
import endpoints from "../../api/endpoints";

const DealerManagerSidebar = () => {
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
      path: "/dealer/dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
    },
    {
      path: "/dealer/orders",
      icon: ShoppingBag,
      label: "Đơn hàng",
    },
    {
      path: "/dealer/quotations",
      icon: FileText,
      label: "Báo giá",
    },
    {
      path: "/dealer/contracts",
      icon: FileCheck,
      label: "Hợp đồng",
    },
    {
      path: "/dealer/transports",
      icon: Truck,
      label: "Vận chuyển",
    },
    {
      path: "/dealer/vehicles",
      icon: Car,
      label: "Xe (B2B)",
    },
    {
      path: "/dealer/warehouses",
      icon: Warehouse,
      label: "Kho hàng",
    },
    {
      path: "/dealer/register-staff",
      icon: UserPlus,
      label: "Đăng ký nhân viên",
    },
    {
      path: "/dealer-manager/contracts",
      icon: Package,
      label: "Hợp đồng Dealer",
    },
    {
      path: "/dealer-manager/reports",
      icon: BarChart3,
      label: "Báo cáo EVM",
    },
    {
      path: "/dealer-manager/deposits",
      icon: CreditCard,
      label: "Đặt cọc",
    },
  ];

  const isActive = (path) => {
    // Handle contracts detail pages
    if (path === "/dealer-manager/contracts") {
      return (
        location.pathname === path || location.pathname.startsWith(path + "/")
      );
    }
    return location.pathname === path;
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
          w-64 shadow-lg overflow-y-auto border-r border-gray-200
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DM</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Dealer System</h2>
              <p className="text-xs text-gray-500">Dealer Manager Portal</p>
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
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menu Chính
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

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

export default DealerManagerSidebar;
