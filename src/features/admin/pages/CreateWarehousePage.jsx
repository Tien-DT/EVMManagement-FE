import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import WarehouseForm from "../components/WarehouseForm";

const CreateWarehousePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/warehouses")}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Warehouses</span>
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Warehouse
        </h1>
        <p className="text-gray-600 mt-1">Thêm kho hàng mới vào hệ thống</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <WarehouseForm />
      </div>
    </div>
  );
};

export default CreateWarehousePage;

