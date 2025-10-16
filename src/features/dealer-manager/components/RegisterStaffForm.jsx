import React from "react";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useRegisterStaff } from "../hooks/useRegisterStaff";

const RegisterStaffForm = () => {
  const { form, onSubmit, isLoading, error, success, setError } =
    useRegisterStaff();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Có lỗi xảy ra</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          Đăng ký nhân viên thành công!
        </div>
      )}

      {/* Form Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <UserPlus className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thông tin nhân viên</h2>
          <p className="text-sm text-gray-600">Tạo tài khoản cho nhân viên dealer</p>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="staff@example.com"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          {...register("fullName")}
          id="fullName"
          type="text"
          placeholder="Nguyễn Văn A"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.fullName ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.fullName.message}</span>
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          {...register("phone")}
          id="phone"
          type="tel"
          placeholder="0912345678"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.phone ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.phone.message}</span>
          </p>
        )}
      </div>

      {/* Card ID */}
      <div>
        <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 mb-2">
          CCCD/CMND <span className="text-red-500">*</span>
        </label>
        <input
          {...register("cardId")}
          id="cardId"
          type="text"
          placeholder="012345678"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.cardId ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.cardId && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.cardId.message}</span>
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              <UserPlus size={20} />
              <span>Đăng ký nhân viên</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterStaffForm;
