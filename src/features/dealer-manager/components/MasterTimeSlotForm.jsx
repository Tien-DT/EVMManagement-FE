// src/features/dealer-manager/components/MasterTimeSlotForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { masterTimeSlotSchema } from "../schemas/masterTimeSlotSchema";
import { calculateDuration, timeToMinutes } from "../../../utils/timeUtils";

// Business hours only: 7h30-11h30 and 13h30-17h30
const BUSINESS_HOURS = [
  { hour: 7, minute: 30, label: "07:30" },
  { hour: 8, minute: 0, label: "08:00" },
  { hour: 8, minute: 30, label: "08:30" },
  { hour: 9, minute: 0, label: "09:00" },
  { hour: 9, minute: 30, label: "09:30" },
  { hour: 10, minute: 0, label: "10:00" },
  { hour: 10, minute: 30, label: "10:30" },
  { hour: 11, minute: 0, label: "11:00" },
  { hour: 11, minute: 30, label: "11:30" },
  { hour: 13, minute: 30, label: "13:30" },
  { hour: 14, minute: 0, label: "14:00" },
  { hour: 14, minute: 30, label: "14:30" },
  { hour: 15, minute: 0, label: "15:00" },
  { hour: 15, minute: 30, label: "15:30" },
  { hour: 16, minute: 0, label: "16:00" },
  { hour: 16, minute: 30, label: "16:30" },
  { hour: 17, minute: 0, label: "17:00" },
  { hour: 17, minute: 30, label: "17:30" },
];

const MasterTimeSlotForm = ({ onSubmit, isSubmitting = false, onCancel, initialData, dealerId }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterTimeSlotSchema),
    defaultValues: initialData || {
      code: "",
      startHour: 8,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
      isActive: false,
      dealerId: dealerId || "",
    },
  });

  // Set dealerId when it becomes available
  React.useEffect(() => {
    if (dealerId) {
      setValue("dealerId", dealerId);
    }
  }, [dealerId, setValue]);

  const watchStartHour = watch("startHour");
  const watchEndHour = watch("endHour");

  // Calculate duration for display
  const displayDuration = React.useMemo(() => {
    const startMin = BUSINESS_HOURS.find((t) => t.hour === watchStartHour)?.minute || 0;
    const endMin = BUSINESS_HOURS.find((t) => t.hour === watchEndHour)?.minute || 0;
    return calculateDuration(
      watchStartHour || 0,
      startMin,
      watchEndHour || 0,
      endMin
    );
  }, [watchStartHour, watchEndHour]);

  // Auto-update startMinute and endMinute when hour changes
  React.useEffect(() => {
    const startMin = BUSINESS_HOURS.find((t) => t.hour === watchStartHour)?.minute || 0;
    const endMin = BUSINESS_HOURS.find((t) => t.hour === watchEndHour)?.minute || 0;
    
    if (watchStartHour) {
      setValue("startMinute", startMin);
    }
    if (watchEndHour) {
      setValue("endMinute", endMin);
    }
  }, [watchStartHour, watchEndHour, setValue]);

  // Auto-update startOffsetMinutes and durationMinutes when form changes
  React.useEffect(() => {
    const startMin = BUSINESS_HOURS.find((t) => t.hour === watchStartHour)?.minute || 0;
    const endMin = BUSINESS_HOURS.find((t) => t.hour === watchEndHour)?.minute || 0;
    
    const startOffset = timeToMinutes(watchStartHour || 0, startMin);
    const duration = calculateDuration(
      watchStartHour || 0,
      startMin,
      watchEndHour || 0,
      endMin
    );
    setValue("startOffsetMinutes", startOffset, { shouldValidate: true });
    setValue("durationMinutes", duration, { shouldValidate: true });
  }, [watchStartHour, watchEndHour, setValue]);

  const handleFormSubmit = (data) => {
    console.log("Form data received:", data);
    
    // Convert to API format
    const startMin = BUSINESS_HOURS.find((t) => t.hour === data.startHour)?.minute || 0;
    const endMin = BUSINESS_HOURS.find((t) => t.hour === data.endHour)?.minute || 0;
    
    const startOffset = timeToMinutes(data.startHour || 0, startMin);
    const duration = calculateDuration(
      data.startHour || 0,
      startMin,
      data.endHour || 0,
      endMin
    );
    
    const payload = {
      code: data.code,
      startOffsetMinutes: startOffset,
      durationMinutes: duration,
      isActive: data.isActive,
      dealerId: data.dealerId,
    };
    
    console.log("Calculated payload:", payload);
    console.log("startHour:", data.startHour, "endHour:", data.endHour);
    console.log("startMin:", startMin, "endMin:", endMin);
    console.log("startOffset:", startOffset, "duration:", duration);
    
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-md p-6"
    >
      {/* Business Hours Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">
          ⏰ Chỉ được chọn giờ hành chính
        </p>
        <p className="text-xs text-blue-700">
          Sáng: 7h30 - 11h30 | Chiều: 13h30 - 17h30
        </p>
      </div>

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
          placeholder="Ví dụ: SLOT_SANG_8H, SLOT_CHIEU_14H..."
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
        <select
          {...register("startHour", { valueAsNumber: true })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.startHour || errors.startOffsetMinutes ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Chọn giờ bắt đầu</option>
          {BUSINESS_HOURS.map((time) => (
            <option key={`${time.hour}-${time.minute}`} value={time.hour}>
              {time.label}
            </option>
          ))}
        </select>
        <input type="hidden" {...register("startMinute", { valueAsNumber: true })} />
        {(errors.startHour || errors.startOffsetMinutes) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.startHour?.message || errors.startOffsetMinutes?.message}
          </p>
        )}
      </div>

      {/* End Time */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Thời gian kết thúc <span className="text-red-500">*</span>
        </label>
        <select
          {...register("endHour", { valueAsNumber: true })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.endHour ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Chọn giờ kết thúc</option>
          {BUSINESS_HOURS.map((time) => (
            <option key={`${time.hour}-${time.minute}`} value={time.hour}>
              {time.label}
            </option>
          ))}
        </select>
        <input type="hidden" {...register("endMinute", { valueAsNumber: true })} />
        {errors.endHour && (
          <p className="mt-1 text-sm text-red-600">{errors.endHour.message}</p>
        )}
      </div>

      {/* Duration Preview */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Thời gian:</span>{" "}
            {String(watchStartHour || 0).padStart(2, "0")}:
            {String(
              BUSINESS_HOURS.find((t) => t.hour === watchStartHour)?.minute || 0
            ).padStart(2, "0")}{" "}
            - {String(watchEndHour || 0).padStart(2, "0")}:
            {String(
              BUSINESS_HOURS.find((t) => t.hour === watchEndHour)?.minute || 0
            ).padStart(2, "0")}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Thời lượng:</span>{" "}
            {displayDuration > 0
              ? `${Math.floor(displayDuration / 60)} giờ ${
                  displayDuration % 60
                } phút (${displayDuration} phút)`
              : "Vui lòng chọn thời gian hợp lệ"}
          </p>
        </div>
        {errors.startOffsetMinutes && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.startOffsetMinutes.message}
          </p>
        )}
      </div>

      {/* Hidden fields for API */}
      <input type="hidden" {...register("startOffsetMinutes")} />
      <input type="hidden" {...register("durationMinutes")} />
      <input type="hidden" {...register("dealerId")} />

      {/* Is Active Checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Kích hoạt slot này ngay sau khi tạo
          </span>
        </label>
        <p className="mt-2 text-xs text-gray-500">
          Đánh dấu nếu muốn slot này sẵn sàng sử dụng ngay
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
          disabled={isSubmitting || displayDuration <= 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {initialData ? "Đang cập nhật..." : "Đang tạo..."}
            </>
          ) : (
            <>
              <Save size={20} />
              {initialData ? "Cập nhật Slot" : "Tạo Slot"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MasterTimeSlotForm;
