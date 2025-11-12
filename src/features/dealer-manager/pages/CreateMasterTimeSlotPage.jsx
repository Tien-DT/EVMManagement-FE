// src/features/dealer-manager/pages/CreateMasterTimeSlotPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import { useMasterTimeSlots } from "../hooks/useMasterTimeSlots";
import { useNotification } from "../../../context/NotificationContext";
import MasterTimeSlotForm from "../components/MasterTimeSlotForm";

const CreateMasterTimeSlotPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Get dealerId from localStorage or context
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Check if dealerId already in localStorage
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
          return;
        }

        // Get user from localStorage
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

        // Import dealerService
        const { dealerService } = await import("../services/dealerService");

        // Fetch user profile to get dealerId
        const userProfile = await dealerService.getUserProfile(accountId);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log("✅ DealerId fetched from API:", fetchedDealerId);

          // Save to localStorage for future use
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

  const { createMasterTimeSlot } = useMasterTimeSlots(dealerId, false);

  const handleSubmit = async (formData) => {
    if (!dealerId) {
      showError("Không tìm thấy thông tin dealer");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = { ...formData, dealerId };
      await createMasterTimeSlot(payload);
      
      showSuccess("Tạo master time slot thành công!");
      navigate("/dealer-manager/master-time-slots");
    } catch (err) {
      const errorMessage = err.message || "Không thể tạo master time slot";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dealer-manager/master-time-slots");
  };

  if (!dealerId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
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
          Tạo Master Time Slot Mới
        </h1>
        <p className="text-gray-600 mt-2">
          Điền thông tin để tạo master time slot mới cho dealer của bạn
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
        dealerId={dealerId}
      />
    </div>
  );
};

export default CreateMasterTimeSlotPage;
