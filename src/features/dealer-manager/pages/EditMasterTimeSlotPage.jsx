// src/features/dealer-manager/pages/EditMasterTimeSlotPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ArrowLeft, Edit, Power, Eye } from "lucide-react";
import { useMasterTimeSlots } from "../hooks/useMasterTimeSlots";
import { useNotification } from "../../../context/NotificationContext";
import MasterTimeSlotForm from "../components/MasterTimeSlotForm";
import { minutesToTime, getStartTime, getEndTime } from "../../../utils/timeUtils";

const EditMasterTimeSlotPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [slotData, setSlotData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Get dealerId from localStorage or context
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          setDealerId(cachedDealerId);
        } else {
          const userStr = localStorage.getItem("user");
          if (!userStr) return;

          const user = JSON.parse(userStr);
          const accountId = user.id;

          const { dealerService } = await import("../services/dealerService");
          const userProfile = await dealerService.getUserProfile(accountId);

          if (userProfile.success && userProfile.data?.dealerId) {
            const fetchedDealerId = userProfile.data.dealerId;
            localStorage.setItem("userProfile", JSON.stringify(userProfile.data));
            localStorage.setItem("dealerId", fetchedDealerId);
            setDealerId(fetchedDealerId);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, []);

  const { getMasterTimeSlotById, updateMasterTimeSlot, updateIsActive } = useMasterTimeSlots(
    dealerId,
    false
  );

  // Fetch master time slot data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getMasterTimeSlotById(id);
        setSlotData(data);

        // Convert API format to form format
        const startTime = minutesToTime(data.startOffsetMinutes);
        const [startHour, startMin] = startTime.split(":").map(Number);

        const endTime = minutesToTime(
          data.startOffsetMinutes + data.durationMinutes
        );
        const [endHour, endMin] = endTime.split(":").map(Number);

        setInitialData({
          code: data.code,
          startTime: `${startHour}:${startMin}`,
          endTime: `${endHour}:${endMin}`,
          startHour,
          startMinute: startMin,
          endHour,
          endMinute: endMin,
          isActive: data.isActive,
          dealerId: data.dealerId,
        });
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu");
        showError(err.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData) => {
    if (!dealerId) {
      showError("Không tìm thấy thông tin dealer");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = { ...formData, dealerId };
      await updateMasterTimeSlot(id, payload);

      showSuccess("Cập nhật master time slot thành công!");
      setIsEditMode(false);
      
      // Refresh data
      const data = await getMasterTimeSlotById(id);
      setSlotData(data);
      const startTime = minutesToTime(data.startOffsetMinutes);
      const [startHour, startMin] = startTime.split(":").map(Number);
      const endTime = minutesToTime(data.startOffsetMinutes + data.durationMinutes);
      const [endHour, endMin] = endTime.split(":").map(Number);
      setInitialData({
        code: data.code,
        startTime: `${startHour}:${startMin}`,
        endTime: `${endHour}:${endMin}`,
        startHour,
        startMinute: startMin,
        endHour,
        endMinute: endMin,
        isActive: data.isActive,
        dealerId: data.dealerId,
      });
    } catch (err) {
      const errorMessage = err.message || "Không thể cập nhật master time slot";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy kích hoạt slot này?")) {
      return;
    }

    try {
      setIsDeactivating(true);
      await updateIsActive(id, false);
      showSuccess("Đã hủy kích hoạt master time slot");
      
      // Refresh data
      const data = await getMasterTimeSlotById(id);
      setSlotData(data);
    } catch (err) {
      showError(err.message || "Không thể hủy kích hoạt");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      navigate("/dealer-manager/master-time-slots");
    }
  };

  if (loading || !dealerId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer-manager/master-time-slots")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              {isEditMode ? "Chỉnh sửa Master Time Slot" : "Chi tiết Master Time Slot"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode ? "Cập nhật thông tin master time slot" : "Xem thông tin chi tiết"}
            </p>
          </div>
          
          {!isEditMode && slotData && (
            <div className="flex gap-3">
              {slotData.isActive && (
                <button
                  onClick={handleDeactivate}
                  disabled={isDeactivating}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Power size={18} />
                  {isDeactivating ? "Đang xử lý..." : "Hủy kích hoạt"}
                </button>
              )}
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                Chỉnh sửa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* View Mode - Display Info */}
      {!isEditMode && slotData && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã Slot
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                {slotData.code}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="px-4 py-3">
                {slotData.isActive ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Power size={16} />
                    Đang kích hoạt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    <Power size={16} />
                    Không kích hoạt
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thời gian bắt đầu
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                {getStartTime(slotData.startOffsetMinutes)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thời gian kết thúc
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                {getEndTime(slotData.startOffsetMinutes, slotData.durationMinutes)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thời lượng
            </label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              {slotData.durationMinutes} phút ({Math.floor(slotData.durationMinutes / 60)} giờ {slotData.durationMinutes % 60} phút)
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dealer ID
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
              {slotData.dealerId}
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode - Form */}
      {isEditMode && (
        <MasterTimeSlotForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialData={initialData}
          dealerId={dealerId}
          readOnly={false}
        />
      )}
    </div>
  );
};

export default EditMasterTimeSlotPage;
