import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useRegisterDealerManager } from "../hooks/useRegisterDealerManager";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const RegisterDealerManagerForm = () => {
  const { form, onSubmit, isLoading, error, success, setError } =
    useRegisterDealerManager();
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Load danh sách dealers
  useEffect(() => {
    const fetchDealers = async () => {
      setLoadingDealers(true);
      try {
        const response = await axiosInstance.get(endpoints.admin.dealers);
        const dealerList = response.data?.items || response.data || [];
        setDealers(Array.isArray(dealerList) ? dealerList : []);
      } catch (err) {
        console.error("Error loading dealers:", err);
      } finally {
        setLoadingDealers(false);
      }
    };

    fetchDealers();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Có lỗi xảy ra
            </h3>
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
          <div className="font-medium">✓ Đăng ký dealer manager thành công!</div>
          <div className="text-sm mt-1">Đang chuyển đến trang dealer để xem thông tin...</div>
        </div>
      )}

      {/* Form Header */}
      <div className="pb-6 mb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Thông tin Dealer Manager
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Điền đầy đủ thông tin bên dưới
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email <span className="text-red-600">*</span>
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="manager@example.com"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Họ và tên <span className="text-red-600">*</span>
          </label>
          <input
            {...register("fullName")}
            id="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.fullName
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{errors.fullName.message}</span>
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Số điện thoại <span className="text-red-600">*</span>
          </label>
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            placeholder="0912345678"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.phone
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{errors.phone.message}</span>
            </p>
          )}
        </div>

        {/* Card ID */}
        <div>
          <label
            htmlFor="cardId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            CCCD/CMND <span className="text-red-600">*</span>
          </label>
          <input
            {...register("cardId")}
            id="cardId"
            type="text"
            placeholder="012345678"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.cardId
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          />
          {errors.cardId && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{errors.cardId.message}</span>
            </p>
          )}
        </div>

        {/* Dealer Selection */}
        <div className="md:col-span-2">
          <label
            htmlFor="dealerId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Dealer <span className="text-red-600">*</span>
          </label>
          <select
            {...register("dealerId")}
            id="dealerId"
            disabled={isLoading || loadingDealers}
            className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition ${
              errors.dealerId
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          >
            <option value="">Chọn dealer</option>
            {dealers.map((dealer) => (
              <option key={dealer.id} value={dealer.id}>
                {dealer.name} {dealer.code ? `(${dealer.code})` : ""}
              </option>
            ))}
          </select>
          {loadingDealers && (
            <p className="mt-1.5 text-sm text-gray-600 flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" />
              <span>Đang tải danh sách dealer...</span>
            </p>
          )}
          {errors.dealerId && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{errors.dealerId.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Tạo tài khoản</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterDealerManagerForm;

