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

const MasterTimeSlotForm = ({ onSubmit, isSubmitting = false, onCancel, initialData, dealerId, readOnly = false }) => {
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
      startTime: "7:30", // Store as "hour:minute" string
      endTime: "8:0",
      startHour: 7,
      startMinute: 30,
      endHour: 8,
      endMinute: 0,
      isActive: true,
      dealerId: dealerId || "",
    },
  });

  // Set dealerId when it becomes available
  React.useEffect(() => {
    if (dealerId) {
      setValue("dealerId", dealerId);
    }
  }, [dealerId, setValue]);

  const watchStartTime = watch("startTime");
  const watchEndTime = watch("endTime");

  // Parse time string to get hour and minute
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 0, minute: 0 };
    const [hour, minute] = timeStr.split(":").map(Number);
    return { hour: hour || 0, minute: minute || 0 };
  };

  // Calculate duration for display
  const displayDuration = React.useMemo(() => {
    const start = parseTime(watchStartTime);
    const end = parseTime(watchEndTime);
    return calculateDuration(start.hour, start.minute, end.hour, end.minute);
  }, [watchStartTime, watchEndTime]);

  // Auto-update startOffsetMinutes and durationMinutes when time changes
  React.useEffect(() => {
    const start = parseTime(watchStartTime);
    const end = parseTime(watchEndTime);
    
    setValue("startHour", start.hour);
    setValue("startMinute", start.minute);
    setValue("endHour", end.hour);
    setValue("endMinute", end.minute);
    
    const startOffset = timeToMinutes(start.hour, start.minute);
    const duration = calculateDuration(start.hour, start.minute, end.hour, end.minute);
    
    setValue("startOffsetMinutes", startOffset, { shouldValidate: true });
    setValue("durationMinutes", duration, { shouldValidate: true });
  }, [watchStartTime, watchEndTime, setValue]);

  const handleFormSubmit = (data) => {
    console.log("Form data received:", data);
    
    const payload = {
      code: data.code,
      startOffsetMinutes: data.startOffsetMinutes,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive,
      dealerId: data.dealerId,
    };
    
    console.log("Calculated payload:", payload);
    
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
          disabled={readOnly}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.code ? "border-red-500" : "border-gray-300"
          } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
          {...register("startTime")}
          disabled={readOnly}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.startOffsetMinutes ? "border-red-500" : "border-gray-300"
          } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Chọn giờ bắt đầu</option>
          {BUSINESS_HOURS.map((time) => (
            <option key={`${time.hour}-${time.minute}`} value={`${time.hour}:${time.minute}`}>
              {time.label}
            </option>
          ))}
        </select>
        <input type="hidden" {...register("startHour", { valueAsNumber: true })} />
        <input type="hidden" {...register("startMinute", { valueAsNumber: true })} />
        {errors.startOffsetMinutes && (
          <p className="mt-1 text-sm text-red-600">
            {errors.startOffsetMinutes?.message}
          </p>
        )}
      </div>

      {/* End Time */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Thời gian kết thúc <span className="text-red-500">*</span>
        </label>
        <select
          {...register("endTime")}
          disabled={readOnly}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.durationMinutes ? "border-red-500" : "border-gray-300"
          } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Chọn giờ kết thúc</option>
          {BUSINESS_HOURS.map((time) => (
            <option key={`${time.hour}-${time.minute}`} value={`${time.hour}:${time.minute}`}>
              {time.label}
            </option>
          ))}
        </select>
        <input type="hidden" {...register("endHour", { valueAsNumber: true })} />
        <input type="hidden" {...register("endMinute", { valueAsNumber: true })} />
        {errors.durationMinutes && (
          <p className="mt-1 text-sm text-red-600">{errors.durationMinutes.message}</p>
        )}
      </div>

      {/* Duration Preview */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Thời gian:</span>{" "}
            {watchStartTime ? BUSINESS_HOURS.find(t => `${t.hour}:${t.minute}` === watchStartTime)?.label || watchStartTime.replace(':', 'h') : ""}
            {" - "}
            {watchEndTime ? BUSINESS_HOURS.find(t => `${t.hour}:${t.minute}` === watchEndTime)?.label || watchEndTime.replace(':', 'h') : ""}
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
        {(errors.startOffsetMinutes || errors.durationMinutes) && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.startOffsetMinutes?.message || errors.durationMinutes?.message}
          </p>
        )}
      </div>

      {/* Hidden fields for API */}
      <input type="hidden" {...register("startOffsetMinutes")} />
      <input type="hidden" {...register("durationMinutes")} />
      <input type="hidden" {...register("dealerId")} />
      <input type="hidden" {...register("isActive")} value="true" />

      {/* Action Buttons */}
      {!readOnly && (
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
            disabled={isSubmitting || displayDuration <= 0 || displayDuration > 120}
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
      )}
    </form>
  );
};

export default MasterTimeSlotForm;
