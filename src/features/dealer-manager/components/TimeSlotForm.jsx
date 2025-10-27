// src/features/dealer-manager/components/TimeSlotForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { timeSlotSchema } from "../schemas/timeSlotSchema";
import { calculateDuration } from "../../../utils/timeUtils";

const TimeSlotForm = ({ onSubmit, isSubmitting = false, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      code: "",
      startHour: 8,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
      isActive: false,
    },
  });

  const watchStartHour = watch("startHour");
  const watchStartMinute = watch("startMinute");
  const watchEndHour = watch("endHour");
  const watchEndMinute = watch("endMinute");

  // Generate options for hours (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  // Generate options for minutes (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-md p-6"
    >
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
            <label className="block text-xs text-gray-600 mb-1">Giờ</label>
            <select
              {...register("startHour", { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startHour ? "border-red-500" : "border-gray-300"
              }`}
            >
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, "0")}:00
                </option>
              ))}
            </select>
            {errors.startHour && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startHour.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phút</label>
            <select
              {...register("startMinute", { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startMinute ? "border-red-500" : "border-gray-300"
              }`}
            >
              {minuteOptions.map((minute) => (
                <option key={minute} value={minute}>
                  {String(minute).padStart(2, "0")} phút
                </option>
              ))}
            </select>
            {errors.startMinute && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startMinute.message}
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Thời gian bắt đầu:{" "}
          <span className="font-semibold">
            {String(watchStartHour || 0).padStart(2, "0")}:
            {String(watchStartMinute || 0).padStart(2, "0")}
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
            <label className="block text-xs text-gray-600 mb-1">Giờ</label>
            <select
              {...register("endHour", { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endHour ? "border-red-500" : "border-gray-300"
              }`}
            >
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, "0")}:00
                </option>
              ))}
            </select>
            {errors.endHour && (
              <p className="mt-1 text-xs text-red-600">
                {errors.endHour.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phút</label>
            <select
              {...register("endMinute", { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endMinute ? "border-red-500" : "border-gray-300"
              }`}
            >
              {minuteOptions.map((minute) => (
                <option key={minute} value={minute}>
                  {String(minute).padStart(2, "0")} phút
                </option>
              ))}
            </select>
            {errors.endMinute && (
              <p className="mt-1 text-xs text-red-600">
                {errors.endMinute.message}
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Thời gian kết thúc:{" "}
          <span className="font-semibold">
            {String(watchEndHour || 0).padStart(2, "0")}:
            {String(watchEndMinute || 0).padStart(2, "0")}
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
          onClick={onCancel}
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
  );
};

export default TimeSlotForm;
