// src/layouts/Sidebar/EVMStaffSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Truck,
  Receipt,
} from "lucide-react";

const EVMStaffSidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  
  const menuItems = [
    {
      name: "Dashboard",
      path: "/evm-staff/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Quotations",
      path: "/evm-staff/quotations",
      icon: <Receipt size={20} />,
    },
    {
      name: "Order Requests",
      path: "/evm-staff/order-requests",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "Contracts",
      path: "/evm-staff/contracts",
      icon: <FileText size={20} />,
    },
    {
      name: "Vehicles",
      path: "/evm-staff/vehicles",
      icon: <Car size={20} />,
    },
    {
      name: "Orders",
      path: "/evm-staff/orders",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "Customers",
      path: "/evm-staff/customers",
      icon: <Users size={20} />,
    },
    {
      name: "Handover Records",
      path: "/evm-staff/handover-records",
      icon: <Truck size={20} />,
    },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-full transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EVM</span>
            </div>
            <h2 className="ml-3 text-lg font-semibold">EVM Staff</h2>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      <div className="py-4">
        <div className="px-4 py-2">
          {!collapsed && (
            <div className="text-xs uppercase text-gray-400 tracking-wider">
              MAIN MENU
            </div>
          )}
          <nav className="mt-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <span className="inline-flex">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default EVMStaffSidebar;