// src/features/dealer-staff/pages/CreateQuotationPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import QuotationForm from "../components/QuotationForm";
import { quotationService } from "../services/quotationService";

const CreateQuotationPage = () => {
  const navigate = useNavigate();

  const handleCreateQuotation = async (data) => {
    try {
      console.log("Creating quotation with data:", data);
      const response = await quotationService.createQuotation(data);

      if (response.success) {
        alert("Tạo báo giá thành công!");
        navigate("/dealer-staff/quotations");
      } else {
        throw new Error(response.message || "Không thể tạo báo giá");
      }
    } catch (error) {
      console.error("Create quotation error:", error);
      alert(`Tạo báo giá thất bại: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo báo giá mới</h1>
          <p className="text-gray-600 mt-1">
            Điền thông tin để tạo báo giá cho khách hàng
          </p>
        </div>
      </div>

      {/* Form */}
      <QuotationForm onSubmit={handleCreateQuotation} mode="create" />
    </div>
  );
};

export default CreateQuotationPage;