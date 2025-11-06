import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useEvmStaff, useEvmStaffMutations } from "../hooks/useEvmStaff";
import { message } from "antd";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  User,
  UserCheck
} from "lucide-react";

export default function EvmStaffListPage() {
  const { staffList, loading, error, reload } = useEvmStaff();
  const { deleteStaff, loading: mutating } = useEvmStaffMutations();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter staff based on search
  const filteredStaff = useMemo(() => {
    return staffList.map(staff => {
      // Đảm bảo email được lấy từ account nếu có
      const email = staff.account?.email || staff.email || null;
      return {
        ...staff,
        email: email
      };
    }).filter(staff => {
      const matchesSearch = staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [staffList, searchTerm]);

  const handleDelete = async (staff) => {
    if (!window.confirm("Are you sure you want to delete this EVM staff? This action cannot be undone.")) return;
    try {
      const staffId = staff.id;
      let accountId = staff.accountId || staff.account?.id;
      
      // If accountId is not available, fetch staff detail to get it
      if (!accountId) {
        try {
          const { default: evmStaffService } = await import("../services/evmStaffService");
          const staffDetail = await evmStaffService.getById(staffId);
          const staffData = staffDetail?.data || staffDetail;
          accountId = staffData.accountId || staffData.account?.id;
        } catch (fetchError) {
          console.warn("Could not fetch staff detail for accountId:", fetchError);
        }
      }
      
      await deleteStaff(staffId, accountId);
      message.success("Xóa EVM staff thành công");
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể xóa EVM staff";
      message.error(errorMessage);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">EVM Staff</h1>
            <p className="text-gray-600 mt-1">Manage your EVM staff members ({filteredStaff.length} staff)</p>
          </div>
        <Link
          to="/admin/evm-staff/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
            <Plus size={20} className="mr-2" />
            Add New Staff
        </Link>
        </div>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(error.message || error)}
        </div>
      )}

      {/* Loading State */}
      {(loading || mutating) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !mutating && filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <UserCheck size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No staff found" : "No EVM staff yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Try adjusting your search criteria" 
              : "Get started by adding your first EVM staff member"}
          </p>
          {!searchTerm && (
            <Link
              to="/admin/evm-staff/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add First Staff Member
            </Link>
          )}
        </div>
      )}

      {/* Staff Grid */}
      {!loading && !mutating && filteredStaff.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <div key={staff.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{staff.fullName || "No name"}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        EVM Staff
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>{staff.phone || "No phone"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{staff.email || "No email"}</span>
                </div>
                
                {staff.cardId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                    <span>CCCD: {staff.cardId}</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/admin/evm-staff/${staff.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <UserCheck size={16} className="mr-2" />
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/evm-staff/${staff.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      <Edit3 size={16} className="mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(staff)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

