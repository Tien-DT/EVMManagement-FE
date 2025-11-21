import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDealers, useDealerMutations } from "../hooks/useDealers";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building2
} from "lucide-react";

export default function DealerListPage() {
  const { dealers, loading, error, reload } = useDealers();
  const { deleteDealer, loading: mutating } = useDealerMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter dealers based on search and status
  const filteredDealers = useMemo(() => {
    return dealers.filter(dealer => {
      const matchesSearch = dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && dealer.isActive) ||
                           (statusFilter === "inactive" && !dealer.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [dealers, searchTerm, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đại lý này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteDealer(id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đại lý</h1>
            <p className="text-gray-600 mt-1">Quản lý mạng lưới đại lý của bạn ({filteredDealers.length} đại lý)</p>
          </div>
        <Link
          to="/admin/dealers/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
            <Plus size={20} className="mr-2" />
            Thêm Đại lý Mới
        </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đại lý theo tên, email hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Chỉ Hoạt động</option>
            <option value="inactive">Chỉ Không hoạt động</option>
          </select>
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
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !mutating && filteredDealers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all" ? "Không tìm thấy đại lý" : "Chưa có đại lý"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc" 
              : "Bắt đầu bằng cách thêm đại lý đầu tiên"}
          </p>
          {(!searchTerm && statusFilter === "all") && (
            <Link
              to="/admin/dealers/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Thêm Đại lý Đầu tiên
            </Link>
          )}
        </div>
      )}

      {/* Dealers Grid */}
      {!loading && !mutating && filteredDealers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <div key={dealer.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{dealer.name}</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dealer.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          dealer.isActive ? "bg-green-400" : "bg-red-400"
                        }`}></div>
                        {dealer.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{dealer.address || "Chưa có địa chỉ"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>{dealer.phone || "Chưa có SĐT"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{dealer.email || "Chưa có email"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>
                    {dealer.establishedAt 
                      ? new Date(dealer.establishedAt).toLocaleDateString() 
                      : "Chưa thiết lập"}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/admin/dealers/${dealer.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Building2 size={16} className="mr-2" />
                    Xem Chi tiết
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/dealers/${dealer.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      <Edit3 size={16} className="mr-2" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(dealer.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Xóa
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