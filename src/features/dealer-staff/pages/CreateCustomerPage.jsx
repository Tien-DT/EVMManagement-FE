// src/features/dealer-staff/pages/CreateCustomerPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../context/NotificationContext";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import CustomerForm from "../components/CustomerForm";

const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { register, handleSubmit, onSubmit: hookOnSubmit, errors, isSubmitting, setValue, watch } =
    useCreateCustomer();

  // Wrap the hook's onSubmit with notification and navigation logic
  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);
    
    try {
      const result = await hookOnSubmit(data);
      console.log("Submit result:", result);
      
      if (result?.success) {
        showSuccess("Tạo khách hàng thành công!");
        // Auto redirect to customers list after 1 second
        setTimeout(() => {
          navigate("/dealer-staff/customers");
        }, 1000);
      } else {
        // Show detailed error message
        const errorMessage = result?.error || "Không thể tạo khách hàng";
        showError(errorMessage);
        console.error("Create customer error:", result);
      }
    } catch (error) {
      console.error("Create customer error:", error);
      showError("Có lỗi xảy ra khi tạo khách hàng: " + (error.message || ""));
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
        handleSubmit={handleSubmit}
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
