import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RegisterDealerManagerForm from "../components/RegisterDealerManagerForm";

const RegisterDealerManagerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 rounded-t-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Register Dealer Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo tài khoản quản lý cho dealer trong hệ thống
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-8">
          <RegisterDealerManagerForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterDealerManagerPage;

