// src/features/dealer-staff/components/CustomerForm.jsx
import React from "react";
import { Calendar, Loader2 } from "lucide-react";

const CustomerForm = ({
  register,
  errors,
  handleSubmit,
  onSubmit,
  setValue,
  watch,
  isSubmitting,
  mode = "create",
}) => {
  const dobValue = watch("dob");

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(onSubmit);
    }} className="space-y-5">
      {/* Họ tên */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          {...register("fullName")}
          type="text"
          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
            errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          placeholder="Nguyễn Văn A"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          {...register("phone")}
          type="text"
          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          placeholder="0912345678"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.phone.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          placeholder="user@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.email.message}
          </p>
        )}
      </div>

      {/* Giới tính */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giới tính <span className="text-red-500">*</span>
        </label>
        <select
          {...register("gender")}
          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
            errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.gender.message}
          </p>
        )}
      </div>

      {/* Địa chỉ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ
        </label>
        <textarea
          {...register("address")}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="123 Đường ABC, Quận 1, TP.HCM"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Ngày sinh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngày sinh
        </label>
        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="date"
            {...register("dob")}
            value={dobValue}
            onChange={(e) => setValue("dob", e.target.value)}
            className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.dob && (
          <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
        )}
      </div>

      {/* CCCD */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CCCD
        </label>
        <input
          {...register("cardId")}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="012345678901"
        />
        {errors.cardId && (
          <p className="text-red-500 text-sm mt-1">{errors.cardId.message}</p>
        )}
      </div>

      {/* Nút hành động */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          <span>
            {isSubmitting
              ? "Đang lưu..."
              : mode === "edit"
              ? "Cập nhật"
              : "Tạo khách hàng"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
