// src/features/dealer-staff/pages/CreateCustomerPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import CustomerForm from "../components/CustomerForm";

const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit: submitForm, errors, isSubmitting, setValue, watch } =
    useCreateCustomer();

  const onSubmit = async (data) => {
    const result = await submitForm(data);
    if (result?.success) {
      message.success("Tạo khách hàng thành công!", 2);
      // Auto redirect to customers list after 1 second
      setTimeout(() => {
        navigate("/dealer-staff/customers");
      }, 1000);
    } else {
      // Show detailed error message
      const errorMessage = result?.error || "Không thể tạo khách hàng";
      message.error(`Lỗi: ${errorMessage}`, 5);
      console.error("Create customer error:", result);
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
