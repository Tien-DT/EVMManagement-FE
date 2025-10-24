// src/features/dealer-manager/pages/CreateTimeSlotPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, ArrowLeft, Save } from "lucide-react";
import { timeSlotSchema } from "../schemas/timeSlotSchema";
import { masterTimeSlotService } from "../services/masterTimeSlotService";
import { timeToMinutes, calculateDuration } from "../../../utils/timeUtils";

const CreateTimeSlotPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      code: "",
      startHour: 0,
      startMinute: 0,
      endHour: 0,
      endMinute: 0,
      isActive: false,
    },
  });

  const watchStartHour = watch("startHour");
  const watchStartMinute = watch("startMinute");
  const watchEndHour = watch("endHour");
  const watchEndMinute = watch("endMinute");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Tính toán startOffsetMinutes và durationMinutes
      const startOffsetMinutes = timeToMinutes(data.startHour, data.startMinute);
      const durationMinutes = calculateDuration(
        data.startHour,
        data.startMinute,
        data.endHour,
        data.endMinute
      );

      // Payload gửi lên API
      const payload = {
        code: data.code,
        startOffsetMinutes,
        durationMinutes,
        isActive: data.isActive,
      };

      console.log("Submitting payload:", payload);

      await masterTimeSlotService.create(payload);

      // Thông báo thành công và chuyển về trang danh sách
      alert("Tạo slot thành công!");
      navigate("/dealer/time-slots");
    } catch (err) {
      setError(err.message || "Không thể tạo slot");
      console.error("Create time slot error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer/time-slots")}
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

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        {/* Code Field */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên Slot <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("code")}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.code ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ví dụ: SLOT1, SLOT2..."
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Thời gian bắt đầu <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Giờ (0-23)</label>
              <input
                type="number"
                {...register("startHour", { valueAsNumber: true })}
                min="0"
                max="23"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startHour ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="8"
              />
              {errors.startHour && (
                <p className="mt-1 text-xs text-red-600">{errors.startHour.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phút (0-59)</label>
              <input
                type="number"
                {...register("startMinute", { valueAsNumber: true })}
                min="0"
                max="59"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startMinute ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="30"
              />
              {errors.startMinute && (
                <p className="mt-1 text-xs text-red-600">{errors.startMinute.message}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Thời gian bắt đầu:{" "}
            <span className="font-semibold">
              {String(watchStartHour || 0).padStart(2, '0')}:
              {String(watchStartMinute || 0).padStart(2, '0')}
            </span>
          </p>
        </div>

        {/* End Time */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Thời gian kết thúc <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Giờ (0-23)</label>
              <input
                type="number"
                {...register("endHour", { valueAsNumber: true })}
                min="0"
                max="23"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endHour ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="9"
              />
              {errors.endHour && (
                <p className="mt-1 text-xs text-red-600">{errors.endHour.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phút (0-59)</label>
              <input
                type="number"
                {...register("endMinute", { valueAsNumber: true })}
                min="0"
                max="59"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endMinute ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="30"
              />
              {errors.endMinute && (
                <p className="mt-1 text-xs text-red-600">{errors.endMinute.message}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Thời gian kết thúc:{" "}
            <span className="font-semibold">
              {String(watchEndHour || 0).padStart(2, '0')}:
              {String(watchEndMinute || 0).padStart(2, '0')}
            </span>
          </p>
        </div>

        {/* Duration Preview */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Thời lượng:</span>{" "}
            {(() => {
              const duration = calculateDuration(
                watchStartHour || 0,
                watchStartMinute || 0,
                watchEndHour || 0,
                watchEndMinute || 0
              );
              const hours = Math.floor(duration / 60);
              const minutes = duration % 60;
              return duration > 0 
                ? `${hours} giờ ${minutes} phút (${duration} phút)`
                : "Vui lòng chọn thời gian hợp lệ";
            })()}
          </p>
        </div>

        {/* Is Active Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Slot này đã có lịch
            </span>
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Đánh dấu nếu khung giờ này đã được đặt lịch
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/dealer/time-slots")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save size={20} />
                Tạo Slot
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTimeSlotPage;