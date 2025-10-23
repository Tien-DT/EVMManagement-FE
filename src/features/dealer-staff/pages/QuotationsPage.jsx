// src/features/dealer-staff/pages/QuotationsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  User,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuotations } from "../hooks/useQuotations";

const QuotationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    quotations,
    isLoading,
    error,
    pagination,
    refreshQuotations,
    deleteQuotation,
    changePage,
  } = useQuotations();

  // Filter quotations based on search
  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      DRAFT: "Nháp",
      PENDING: "Chờ xử lý",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      EXPIRED: "Hết hạn",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
          status
        )}`}
      >
        {statusMap[status] || status || "N/A"}
      </span>
    );
  };

  const getStatusColor = (status) => {
    const colorMap = {
      DRAFT: "bg-gray-100 text-gray-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách báo giá...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshQuotations()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý báo giá</h1>
          <p className="text-gray-600 mt-1">
            Danh sách báo giá và thông tin chi tiết
          </p>
        </div>
        <button
          onClick={() => navigate("/dealer-staff/quotations/create")}
          className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Tạo báo giá mới</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã báo giá hoặc tên khách hàng..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã báo giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiệu lực đến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-blue-500" />
                        <span className="font-medium text-gray-900">
                          {quotation.code || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span>{quotation.customerName || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(quotation.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(quotation.validUntil)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusDisplay(quotation.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/dealer-staff/quotations/${quotation.id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/evm-staff/quotations/edit/${quotation.id}`
                            )
                          }
                          className="text-green-600 hover:text-green-900"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn xóa báo giá này?"
                              )
                            ) {
                              const result = await deleteQuotation(
                                quotation.id
                              );
                              if (result.success) {
                                alert("Xóa báo giá thành công!");
                              } else {
                                alert(
                                  `Lỗi: ${
                                    result.error || "Không thể xóa báo giá"
                                  }`
                                );
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-center">
                      <FileText
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy báo giá
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm
                          ? "Thử điều chỉnh từ khóa tìm kiếm"
                          : "Tạo báo giá đầu tiên để bắt đầu"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() =>
                            navigate("/evm-staff/quotations/create")
                          }
                          className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus size={20} />
                          <span>Tạo báo giá mới</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredQuotations.length} trong tổng số{" "}
              {pagination.totalCount} báo giá
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationsPage;
