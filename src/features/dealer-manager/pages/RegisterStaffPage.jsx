import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RegisterStaffForm from "../components/RegisterStaffForm";

const RegisterStaffPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dealer/dashboard")}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register Staff</h1>
        <p className="text-gray-600 mt-1">Tạo tài khoản nhân viên cho dealer của bạn</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <RegisterStaffForm />
      </div>
    </div>
  );
};

export default RegisterStaffPage;
