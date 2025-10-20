// src/features/dealer-staff/pages/CreateCustomerPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import CustomerForm from "../components/CustomerForm";

const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit: submitForm, errors, isSubmitting, setValue, watch } =
    useCreateCustomer();

  const onSubmit = async (data) => {
    const result = await submitForm(data);
    if (result?.success) {
      alert("Tạo khách hàng thành công!");
      navigate("/dealer-staff/customers");
    } else {
      alert(`Lỗi: ${result?.error || "Không thể tạo khách hàng"}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tạo hồ sơ khách hàng
      </h1>
      <CustomerForm
        register={register}
        errors={errors}
        handleSubmit={submitForm}
        onSubmit={onSubmit}
        setValue={setValue}
        watch={watch}
        isSubmitting={isSubmitting}
        mode="create"
      />
    </div>
  );
};

export default CreateCustomerPage;
