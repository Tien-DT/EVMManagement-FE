// src/features/dealer-manager/pages/MasterTimeSlotsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Plus,
  Search,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useMasterTimeSlots } from "../hooks/useMasterTimeSlots";
import { useNotification } from "../../../context/NotificationContext";
import { getStartTime, getEndTime } from "../../../utils/timeUtils";

const MasterTimeSlotsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerId, setDealerId] = useState(null);

  // Get dealerId from localStorage or context
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
          return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in localStorage");
          setDealerId(null);
          return;
        }

        const user = JSON.parse(userStr);
        const accountId = user.id;

        if (!accountId) {
          console.error("❌ No accountId found in user");
          setDealerId(null);
          return;
        }

        console.log("🔍 Fetching dealerId for accountId:", accountId);

        const { dealerService } = await import("../services/dealerService");
        const userProfile = await dealerService.getUserProfile(accountId);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log("✅ DealerId fetched from API:", fetchedDealerId);

          localStorage.setItem("userProfile", JSON.stringify(userProfile.data));
          localStorage.setItem("dealerId", fetchedDealerId);

          setDealerId(fetchedDealerId);
        } else {
          console.error("❌ No dealerId found in user profile");
          setDealerId(null);
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
        setDealerId(null);
      }
    };

    fetchDealerId();
  }, []);

  const {
    masterTimeSlots,
    loading,
    error,
    pagination,
    updateIsActive,
    deleteMasterTimeSlot,
    changePage,
  } = useMasterTimeSlots(dealerId, !!dealerId);

  const filteredSlots = masterTimeSlots.filter((slot) =>
    slot.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count active timeslots
  const activeTimeslotsCount = masterTimeSlots.filter(
    slot => slot.isActive === true || slot.isActive === 1
  ).length;

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateIsActive(id, newStatus);
      
      showSuccess(
        newStatus
          ? "Kích hoạt master time slot thành công"
          : "Vô hiệu hóa master time slot thành công"
      );
    } catch (err) {
      showError(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa master time slot này?")) {
      return;
    }

    try {
      await deleteMasterTimeSlot(id);
      showSuccess("Xóa master time slot thành công");
    } catch (err) {
      showError(err.message || "Không thể xóa master time slot");
    }
  };

  // Loading state - only show initial loading when fetching dealerId
  if (loading && !dealerId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              Quản lý Master Time Slots
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các khung giờ master cho dealer của bạn
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Timeslots Active</div>
            <div className="text-2xl font-bold">
              <span className={activeTimeslotsCount >= 4 ? "text-red-600" : "text-blue-600"}>
                {activeTimeslotsCount}
              </span>
              <span className="text-gray-400"> / 4</span>
            </div>
            {activeTimeslotsCount >= 4 && (
              <div className="text-xs text-red-600 mt-1">
                Đã đạt giới hạn tối đa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Master Slot Button - Only show if active slots < 4 */}
      {activeTimeslotsCount < 4 && (
        <div className="mb-6">
          <button
            onClick={() => navigate("/dealer-manager/master-time-slots/create")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            Tạo Master Slot Mới
          </button>
        </div>
      )}

      {/* Master Time Slots List */}
      <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Master Time Slots List */}
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Không có master slot nào
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {slot.code}
                          </h3>
                          {slot.isActive ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle size={14} />
                              Đang sử dụng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              <XCircle size={14} />
                              Không sử dụng
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Bắt đầu:</span>{" "}
                            {getStartTime(slot.startOffsetMinutes)}
                          </p>
                          <p>
                            <span className="font-medium">Kết thúc:</span>{" "}
                            {getEndTime(
                              slot.startOffsetMinutes,
                              slot.durationMinutes
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Thời lượng:</span>{" "}
                            {slot.durationMinutes} phút
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(slot.id, slot.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            slot.isActive
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title={slot.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {slot.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/dealer-manager/master-time-slots/${slot.id}`
                            )
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{filteredSlots.length}</span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{pagination.totalItems}</span> slots
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default MasterTimeSlotsPage;
