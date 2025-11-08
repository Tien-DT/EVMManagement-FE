// src/features/dealer-staff/pages/CreateTestDriveBookingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCreateTestDriveBooking } from "../hooks/useCreateTestDriveBooking";
import TestDriveBookingForm from "../components/TestDriveBookingForm";
import { useNotification } from "../../../context/NotificationContext";

const CreateTestDriveBookingPage = () => {
  const navigate = useNavigate();
  const { createBooking, isSubmitting } = useCreateTestDriveBooking();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting test drive booking:", formData);
      
      // Ensure dealerStaffId is set
      if (!formData.dealerStaffId) {
        showError("Không xác định được nhân viên. Vui lòng đăng nhập lại.");
        return;
      }

      const result = await createBooking(formData);
      
      if (result.success) {
        showSuccess("Tạo đặt chỗ lái thử thành công!");
        // Navigate to test drive bookings list after 1 second
        setTimeout(() => {
          navigate("/dealer-staff/test-drive-bookings");
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating test drive booking:", error);
      showError("Có lỗi xảy ra khi tạo đặt chỗ lái thử");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dealer-staff/test-drive-bookings")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo đặt chỗ lái thử
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo đặt chỗ lái thử mới cho khách hàng
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-100">
          <TestDriveBookingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default CreateTestDriveBookingPage;
