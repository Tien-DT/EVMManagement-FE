import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  UserPlus,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const DealerManagerSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      path: "/dealer/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/dealer/warehouses",
      icon: Warehouse,
      label: "Warehouses",
    },
    {
      path: "/dealer/register-staff",
      icon: UserPlus,
      label: "Register Staff",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
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
          fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 
          text-white transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:fixed
          w-64 shadow-2xl overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DM</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Dealer Manager</h2>
              <p className="text-xs text-blue-300">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider px-3 mb-3">
            Main Menu
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
                  flex items-center justify-between px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"
                      : "hover:bg-blue-700/50"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    size={20}
                    className={
                      active
                        ? "text-white"
                        : "text-blue-300 group-hover:text-white"
                    }
                  />
                  <span
                    className={`font-medium ${
                      active ? "text-white" : "text-blue-200"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    active
                      ? "text-white"
                      : "text-blue-400 group-hover:text-white group-hover:translate-x-1"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-sm font-semibold mb-2">Need help?</h3>
            <p className="text-xs text-blue-300 mb-3">Contact support team</p>
            <button className="w-full py-2 px-4 bg-white text-blue-900 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              GET SUPPORT
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DealerManagerSidebar;
