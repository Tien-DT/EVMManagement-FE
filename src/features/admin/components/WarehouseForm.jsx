import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, Package } from "lucide-react";
import { useCreateWarehouse, useUpdateWarehouse } from "../hooks/useCreateWarehouse";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const WarehouseForm = ({ warehouseId }) => {
  const isEdit = !!warehouseId;
  
  // Always call both hooks unconditionally
  const createWarehouseHook = useCreateWarehouse();
  const updateWarehouseHook = useUpdateWarehouse(warehouseId);
  
  // Then select which one to use
  const { form, onSubmit, isLoading, error, setError } = isEdit
    ? updateWarehouseHook
    : createWarehouseHook;

  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingWarehouse, setLoadingWarehouse] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  // Load dealers
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

  // Load warehouse data if editing
  useEffect(() => {
    if (isEdit && warehouseId) {
      const fetchWarehouse = async () => {
        setLoadingWarehouse(true);
        try {
          const response = await axiosInstance.get(
            endpoints.admin.warehousesById(warehouseId)
          );
          if (response.success && response.data) {
            const data = response.data;
            setValue("name", data.name || "");
            setValue("address", data.address || "");
            setValue("capacity", data.capacity || 100);
            setValue("dealerId", data.dealerId || "");
            setValue("type", data.type || "DEALER");
          }
        } catch (err) {
          console.error("Error loading warehouse:", err);
          setError("Không thể tải thông tin kho hàng");
        } finally {
          setLoadingWarehouse(false);
        }
      };

      fetchWarehouse();
    }
  }, [isEdit, warehouseId, setValue, setError]);

  if (loadingWarehouse) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

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
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <Package className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Cập nhật kho hàng" : "Thông tin kho hàng"}
          </h2>
          <p className="text-sm text-gray-600">
            {isEdit
              ? "Cập nhật thông tin kho hàng"
              : "Điền đầy đủ thông tin để tạo kho mới"}
          </p>
        </div>
      </div>

      {/* Dealer Selection */}
      <div>
        <label
          htmlFor="dealerId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Dealer <span className="text-red-500">*</span>
        </label>
        <select
          {...register("dealerId", { required: "Vui lòng chọn dealer" })}
          id="dealerId"
          disabled={isLoading || loadingDealers}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.dealerId
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        >
          <option value="">-- Chọn Dealer --</option>
          {dealers.map((dealer) => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.name || dealer.companyName || dealer.id}
            </option>
          ))}
        </select>
        {errors.dealerId && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.dealerId.message}</span>
          </p>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tên kho hàng <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          placeholder="Ví dụ: Kho chính Quận 1"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.name
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.name.message}</span>
          </p>
        )}
      </div>

      {/* Address Field */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Địa chỉ <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("address")}
          id="address"
          rows={3}
          placeholder="Nhập địa chỉ đầy đủ của kho hàng"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            errors.address
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.address.message}</span>
          </p>
        )}
      </div>

      {/* Capacity Field */}
      <div>
        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Sức chứa <span className="text-red-500">*</span>
        </label>
        <input
          {...register("capacity", { valueAsNumber: true })}
          id="capacity"
          type="number"
          min="1"
          placeholder="Nhập sức chứa của kho"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.capacity
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {errors.capacity && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle size={14} />
            <span>{errors.capacity.message}</span>
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Đơn vị: số lượng xe có thể lưu trữ
        </p>
      </div>

      {/* Type Info (Read-only) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-blue-700">
            <span className="font-medium">Loại kho:</span> DEALER (Mặc định)
          </div>
        </div>
      </div>

      {/* Submit Button */}
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
              <span>{isEdit ? "Đang cập nhật..." : "Đang tạo..."}</span>
            </>
          ) : (
            <>
              <Package size={20} />
              <span>{isEdit ? "Cập nhật kho hàng" : "Tạo kho hàng"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default WarehouseForm;

