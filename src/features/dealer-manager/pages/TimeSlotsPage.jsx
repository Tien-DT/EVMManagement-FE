// src/features/dealer-manager/pages/TimeSlotsPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Plus, Trash2, Eye, CheckCircle, XCircle, Search } from "lucide-react";
import { useTimeSlots } from "../hooks/useTimeSlots";
import { getStartTime, getEndTime } from "../../../utils/timeUtils";

const TimeSlotsPage = () => {
  const navigate = useNavigate();
  const { timeSlots, loading, error, pagination, deleteTimeSlot, changePage } =
    useTimeSlots(10);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter time slots
  const filteredSlots = useMemo(() => {
    return timeSlots.filter(slot => {
      const matchesSearch = slot.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && slot.isActive) ||
                           (statusFilter === "inactive" && !slot.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [timeSlots, searchTerm, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa slot này?")) {
      return;
    }

    const result = await deleteTimeSlot(id);
    if (!result.success) {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Quản lý Time Slots
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý các khung giờ làm việc của hệ thống
          </p>
        </div>
        <button
          onClick={() => navigate("/dealer/time-slots/create")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Tạo Slot Mới
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đã có lịch</option>
            <option value="inactive">Chưa có lịch</option>
          </select>
        </div>
      </div>

      {/* Time Slots Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Mã Slot
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Thời gian bắt đầu
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Thời gian kết thúc
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || statusFilter !== "all" ? "Không tìm thấy slot phù hợp" : "Không có slot nào"}
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => (
                  <tr
                    key={slot.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {slot.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">
                        {getStartTime(slot.startOffsetMinutes)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">
                        {getEndTime(
                          slot.startOffsetMinutes,
                          slot.durationMinutes
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {slot.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle size={16} />
                          Đã có lịch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          <XCircle size={16} />
                          Chưa có lịch
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dealer/time-slots/${slot.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{filteredSlots.length}</span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{pagination.totalCount}</span> slots
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changePage(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                {pagination.pageNumber} / {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TimeSlotsPage;
