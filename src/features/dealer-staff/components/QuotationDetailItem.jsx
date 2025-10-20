// src/features/evm-staff/components/QuotationDetailItem.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const QuotationDetailItem = ({
  index,
  register,
  errors,
  removeDetail,
  watch,
}) => {
  const discountPercent = watch(`quotationDetails.${index}.discountPercent`) || 0;
  const unitPrice = watch(`quotationDetails.${index}.unitPrice`) || 0;
  const quantity = watch(`quotationDetails.${index}.quantity`) || 0;
  
  // Tính toán giá sau giảm giá
  const discountedPrice = unitPrice - (unitPrice * discountPercent / 100);
  const totalPrice = discountedPrice * quantity;

  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Chi tiết báo giá #{index + 1}</h3>
        <button
          type="button"
          onClick={() => removeDetail(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mẫu xe *
          </label>
          <select
            {...register(`quotationDetails.${index}.vehicleVariantId`)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn mẫu xe</option>
            {/* Tạm thời để option mẫu, sau này sẽ lấy từ API */}
            <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Mẫu xe 1</option>
            <option value="4fa85f64-5717-4562-b3fc-2c963f66afa7">Mẫu xe 2</option>
          </select>
          {errors?.quotationDetails?.[index]?.vehicleVariantId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.quotationDetails[index].vehicleVariantId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng *
          </label>
          <input
            type="number"
            {...register(`quotationDetails.${index}.quantity`, {
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số lượng"
            min="1"
          />
          {errors?.quotationDetails?.[index]?.quantity && (
            <p className="text-red-500 text-xs mt-1">
              {errors.quotationDetails[index].quantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đơn giá *
          </label>
          <input
            type="number"
            {...register(`quotationDetails.${index}.unitPrice`, {
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập đơn giá"
            min="0"
          />
          {errors?.quotationDetails?.[index]?.unitPrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.quotationDetails[index].unitPrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phần trăm giảm giá (%) *
          </label>
          <input
            type="number"
            {...register(`quotationDetails.${index}.discountPercent`, {
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập % giảm giá"
            min="0"
            max="100"
          />
          {errors?.quotationDetails?.[index]?.discountPercent && (
            <p className="text-red-500 text-xs mt-1">
              {errors.quotationDetails[index].discountPercent.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          {...register(`quotationDetails.${index}.note`)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập ghi chú (nếu có)"
          rows="2"
        ></textarea>
      </div>

      <div className="bg-gray-100 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Giá sau giảm:</span>
          <span className="font-medium text-gray-900">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(discountedPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-medium text-gray-700">Thành tiền:</span>
          <span className="font-medium text-blue-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailItem;