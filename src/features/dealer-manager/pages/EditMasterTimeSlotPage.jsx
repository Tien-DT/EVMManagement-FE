// src/features/dealer-manager/pages/EditMasterTimeSlotPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import { useMasterTimeSlots } from "../hooks/useMasterTimeSlots";
import { useNotification } from "../../../context/NotificationContext";
import MasterTimeSlotForm from "../components/MasterTimeSlotForm";
import { minutesToTime } from "../../../utils/timeUtils";

const EditMasterTimeSlotPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

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

  const { getMasterTimeSlotById, updateMasterTimeSlot } = useMasterTimeSlots(
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

        // Convert API format to form format
        const startTime = minutesToTime(data.startOffsetMinutes);
        const [startHour, startMin] = startTime.split(":").map(Number);

        const endTime = minutesToTime(
          data.startOffsetMinutes + data.durationMinutes
        );
        const [endHour, endMin] = endTime.split(":").map(Number);

        setInitialData({
          code: data.code,
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
  }, [id, getMasterTimeSlotById, showError]);

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
      navigate("/dealer-manager/master-time-slots");
    } catch (err) {
      const errorMessage = err.message || "Không thể cập nhật master time slot";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dealer-manager/master-time-slots");
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
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          Chỉnh sửa Master Time Slot
        </h1>
        <p className="text-gray-600 mt-2">
          Cập nhật thông tin master time slot
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Component */}
      <MasterTimeSlotForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        initialData={initialData}
        dealerId={dealerId}
      />
    </div>
  );
};

export default EditMasterTimeSlotPage;
