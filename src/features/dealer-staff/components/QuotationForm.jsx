// src/features/dealer-staff/components/QuotationForm.jsx
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { quotationSchema } from "../schemas/quotationSchema";
import QuotationDetailItem from "./QuotationDetailItem";
import { useAuth } from "../../../hooks/useAuth";

const QuotationForm = ({ onSubmit, defaultValues = {}, mode = "create" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thiết lập giá trị mặc định cho form
  const formDefaultValues = {
    code: defaultValues.code || "",
    customerId: defaultValues.customerId || "",
    createdByUserId: defaultValues.createdByUserId || user?.id || "",
    note: defaultValues.note || "",
    status: defaultValues.status || "DRAFT",
    validUntil:
      defaultValues.validUntil ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 ngày sau
    quotationDetails: defaultValues.quotationDetails || [
      {
        vehicleVariantId: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        note: "",
      },
    ],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: formDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotationDetails",
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewDetail = () => {
    append({
      vehicleVariantId: "",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      note: "",
    });
  };

  // Tính tổng giá trị báo giá
  const quotationDetails = watch("quotationDetails") || [];
  const totalAmount = quotationDetails.reduce((sum, detail) => {
    const unitPrice = detail.unitPrice || 0;
    const quantity = detail.quantity || 0;
    const discountPercent = detail.discountPercent || 0;
    const discountedPrice = unitPrice - (unitPrice * discountPercent) / 100;
    return sum + discountedPrice * quantity;
  }, 0);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mã báo giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã báo giá *
          </label>
          <input
            type="text"
            {...register("code")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mã báo giá"
          />
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* Khách hàng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng *
          </label>
          <select
            {...register("customerId")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn khách hàng</option>
            {/* Tạm thời để option mẫu, sau này sẽ lấy từ API */}
            <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">
              Nguyễn Văn A
            </option>
            <option value="4fa85f64-5717-4562-b3fc-2c963f66afa7">
              Trần Thị B
            </option>
          </select>
          {errors.customerId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.customerId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ngày hết hạn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày hết hạn *
          </label>
          <input
            type="date"
            {...register("validUntil")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.validUntil && (
            <p className="text-red-500 text-xs mt-1">
              {errors.validUntil.message}
            </p>
          )}
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            {...register("status")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="DRAFT">Nháp</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          {...register("note")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập ghi chú (nếu có)"
          rows="3"
        ></textarea>
      </div>

      {/* ID người tạo (ẩn) */}
      <input type="hidden" {...register("createdByUserId")} />

      {/* Chi tiết báo giá */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Chi tiết báo giá
          </h3>
          <button
            type="button"
            onClick={addNewDetail}
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>Thêm chi tiết</span>
          </button>
        </div>

        {fields.map((field, index) => (
          <QuotationDetailItem
            key={field.id}
            index={index}
            register={register}
            errors={errors}
            removeDetail={remove}
            watch={watch}
          />
        ))}

        {errors.quotationDetails && (
          <p className="text-red-500 text-xs mt-1">
            {errors.quotationDetails.message}
          </p>
        )}

        {/* Tổng giá trị */}
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              Tổng giá trị:
            </span>
            <span className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate("/evm-staff/quotations")}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          <Save size={20} />
          <span>{isSubmitting ? "Đang lưu..." : "Lưu báo giá"}</span>
        </button>
      </div>
    </form>
  );
};

export default QuotationForm;
