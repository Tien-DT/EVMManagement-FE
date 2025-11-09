// src/features/dealer-staff/pages/EditCustomerPage.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../../context/NotificationContext";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import CustomerForm from "../components/CustomerForm";
import { Loader2 } from "lucide-react";

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const { 
    register, 
    handleSubmit, 
    onSubmit: hookOnSubmit, 
    errors, 
    isSubmitting, 
    isLoading,
    setValue, 
    watch 
  } = useUpdateCustomer(id);

  // Wrap the hook's onSubmit with notification and navigation logic
  const onSubmit = async (data) => {
    try {
      const result = await hookOnSubmit(data);
      if (result?.success) {
        showSuccess("Cập nhật khách hàng thành công!");
        // Auto redirect to customers list page after 1 second
        setTimeout(() => {
          navigate("/dealer-staff/customers");
        }, 1000);
      } else {
        const errorMessage = result?.error || "Không thể cập nhật khách hàng";
        showError(errorMessage);
        console.error("Update customer error:", result);
      }
    } catch (error) {
      console.error("Update customer error:", error);
      showError("Có lỗi xảy ra khi cập nhật khách hàng");
    }
  };

  // Show loading state only if we have a customerId and are loading
  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin khách hàng...</p>
        </div>
      </div>
    );
  }

  // If no ID, show error
  if (!id) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Không tìm thấy ID khách hàng</p>
          <button
            onClick={() => navigate("/dealer-staff/customers")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Chỉnh sửa hồ sơ khách hàng
      </h1>
      <CustomerForm
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        setValue={setValue}
        watch={watch}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </div>
  );
};

export default EditCustomerPage;

