// src/features/dealer-staff/pages/CreateQuotationPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import QuotationForm from "../components/QuotationForm";
import { useCreateQuotation } from "../hooks/useCreateQuotation";
import { useNotification } from "../../../context/NotificationContext";

export const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    control,
    watch,
    setValue,
  } = useCreateQuotation();

  const onSubmit = async (data) => {
    const result = await handleSubmit(data);
    if (result.success) {
      showSuccess("Tạo báo giá thành công!");
      navigate("/dealer-staff/quotations");
    } else {
      showError(result.error || "Có lỗi xảy ra khi tạo báo giá");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dealer-staff/quotations")}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Tạo báo giá mới
        </h1>
      </div>

      <QuotationForm
        register={register}
        onSubmit={onSubmit}
        errors={errors}
        isSubmitting={isSubmitting}
        control={control}
        watch={watch}
        setValue={setValue}
      />
    </div>
  );
};

export default CreateQuotationPage;
