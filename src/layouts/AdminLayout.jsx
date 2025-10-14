import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './sidebar/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Type here..."
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <span className="text-sm">🔔</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <span className="text-sm font-medium">Sign In</span>
                <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  👤
                </span>
              </button>
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