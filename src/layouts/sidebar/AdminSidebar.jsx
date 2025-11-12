import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Menu,
  X,
  User,
  Building2,
  Car,
  Tag,
  UserCog,
  UserCheck,
  Settings,
  FileText,
  Package,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuGroups = [
    {
      title: "Chính",
      items: [
        {
          path: "/admin/dashboard",
          icon: LayoutDashboard,
          label: "Tổng quan",
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          path: "/admin/dealers",
          icon: Building2,
          label: "Đại lý",
        },
        {
          path: "/admin/dealer-contracts",
          icon: FileText,
          label: "Hợp đồng Dealer",
        },
        {
          path: "/admin/evm-staff",
          icon: UserCheck,
          label: "Nhân viên EVM",
        },
        {
          path: "/admin/register-dealer-manager",
          icon: UserCog,
          label: "Quản lý Dealer",
        },
        {
          path: "/admin/vehiclemodels",
          icon: Car,
          label: "Xe (B2B)",
        },
        {
          path: "/admin/promotions",
          icon: Tag,
          label: "Khuyến mãi",
        },
        {
          path: "/admin/warehouses",
          icon: Package,
          label: "Kho hàng",
        },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        {
          path: "/admin/profile",
          icon: User,
          label: "Hồ sơ của tôi",
        },
      ],
    },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        {isMobileOpen ? (
          <X size={20} className="text-gray-700" />
        ) : (
          <Menu size={20} className="text-gray-700" />
        )}
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
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:fixed
          w-64 shadow-sm overflow-y-auto
        `}
      >
        {/* Header / Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">EV</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">EVM System</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group
                        ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        className={
                          active
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          active ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
