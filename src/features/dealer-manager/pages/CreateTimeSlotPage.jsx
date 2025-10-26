// src/features/dealer-manager/pages/CreateTimeSlotPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import { useCreateTimeSlot } from "../hooks/useCreateTimeSlot";
import TimeSlotForm from "../components/TimeSlotForm";

const CreateTimeSlotPage = () => {
  const navigate = useNavigate();
  const { createTimeSlot, isSubmitting, error } = useCreateTimeSlot();

  const handleSubmit = async (formData) => {
    await createTimeSlot(formData);
  };

  const handleCancel = () => {
    navigate("/dealer/time-slots");
  };

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
          Tạo Time Slot Mới
        </h1>
        <p className="text-gray-600 mt-2">
          Điền thông tin để tạo khung giờ làm việc mới
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Component */}
      <TimeSlotForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreateTimeSlotPage;
