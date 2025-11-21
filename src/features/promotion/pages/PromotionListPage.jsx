import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePromotions, usePromotionMutations } from "../hooks/usePromotions";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Percent,
  Tag
} from "lucide-react";

const columns = [
  { key: "code", label: "Mã" },
  { key: "name", label: "Tên" },
  { key: "description", label: "Mô tả" },
  { key: "discountPercent", label: "Giảm giá" },
  { key: "startAt", label: "Ngày bắt đầu" },
  { key: "endAt", label: "Ngày kết thúc" },
  { key: "isActive", label: "Trạng thái" },
];

export default function PromotionListPage() {
  const { promotions, loading, error, reload } = usePromotions();
  const { deletePromotion, loading: mutating } = usePromotionMutations();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) return;
    
    setDeletingId(id);
    try {
      await deletePromotion(id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDiscount = (percent) => {
    return `${percent}%`;
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Hoạt động" : "Không hoạt động"}
      </span>
    );
  };

  const isPromotionExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isPromotionUpcoming = (startDate) => {
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Quản lý các chương trình khuyến mãi và giảm giá</p>
        </div>
        <Link
          to="/admin/promotions/new"
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Thêm Khuyến mãi
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(error.message || error)}
        </div>
      )}

      {/* Loading State */}
      {(loading || mutating) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {loading ? "Đang tải khuyến mãi..." : "Đang xử lý..."}
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {promotion.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {promotion.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {promotion.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Percent size={16} className="text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDiscount(promotion.discountPercent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(promotion.startAt)}
                      </span>
                    </div>
                    {isPromotionUpcoming(promotion.startAt) && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Sắp diễn ra
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(promotion.endAt)}
                      </span>
                    </div>
                    {isPromotionExpired(promotion.endAt) && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Hết hạn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(promotion.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Edit Button */}
                      <Link
                        to={`/admin/promotions/${promotion.id}/edit`}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={20} />
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        disabled={deletingId === promotion.id}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        {deletingId === promotion.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && promotions.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-gray-500"
                    colSpan={columns.length + 1}
                  >
                    <div className="flex flex-col items-center">
                      <Tag size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khuyến mãi</p>
                      <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo khuyến mãi đầu tiên</p>
                      <Link
                        to="/admin/promotions/new"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <Plus size={20} className="mr-2" />
                        Tạo Khuyến mãi
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
