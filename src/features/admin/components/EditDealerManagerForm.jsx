import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import userProfileService from "../../../services/userProfileService";

const EditDealerManagerForm = ({ manager, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      fullName: manager?.fullName || "",
      phone: manager?.phone || "",
      cardId: manager?.cardId || "",
      email: manager?.email || "",
      dealerId: manager?.dealerId || "",
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

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

  // Set form values when manager changes
  useEffect(() => {
    if (manager) {
      setValue("fullName", manager.fullName || "");
      setValue("phone", manager.phone || "");
      setValue("cardId", manager.cardId || "");
      setValue("email", manager.email || "");
      setValue("dealerId", manager.dealerId || "");
    }
  }, [manager, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // PATCH /v1/Dealers/{id} - using Dealers API
      if (!manager?.dealerId) {
        throw new Error("Không tìm thấy dealer ID để cập nhật");
      }

      const payload = {
        name: data.fullName || manager.dealer?.name,
        phone: data.phone,
        // Add other dealer fields as needed
      };

      await axiosInstance.patch(endpoints.admin.dealersById(manager.dealerId), payload);
      
      // Also update UserProfile if needed
      try {
        const userProfilePayload = {
          fullName: data.fullName,
          phone: data.phone,
          cardId: data.cardId,
          email: data.email,
          dealerId: data.dealerId || null,
        };
        const accId = manager.accountId || manager.id;
        if (accId) {
          await userProfileService.updateByAccId(accId, userProfilePayload);
        }
      } catch (profileError) {
        console.warn("Failed to update user profile:", profileError);
        // Continue even if profile update fails
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error updating dealer manager:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể cập nhật dealer manager";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Form Header */}
      <div className="pb-6 mb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Chỉnh sửa Dealer Manager
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Cập nhật thông tin bên dưới
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email - Read only */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            disabled={true}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Email không thể thay đổi
          </p>
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
            {...register("fullName", {
              required: "Họ và tên là bắt buộc",
              minLength: {
                value: 2,
                message: "Họ và tên phải có ít nhất 2 ký tự"
              }
            })}
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
            {...register("phone", {
              required: "Số điện thoại là bắt buộc",
              pattern: {
                value: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ"
              }
            })}
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
            {...register("cardId", {
              required: "CCCD/CMND là bắt buộc",
              minLength: {
                value: 9,
                message: "CCCD/CMND phải có ít nhất 9 ký tự"
              }
            })}
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
            {...register("dealerId", {
              required: "Dealer là bắt buộc"
            })}
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
          onClick={onCancel}
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
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditDealerManagerForm;

