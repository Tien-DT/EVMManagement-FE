import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CreateWarehouseForm from "../components/CreateWarehouseForm";

const CreateWarehousePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dealer/warehouses")}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Warehouses</span>
      </button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Warehouse
        </h1>
        <p className="text-gray-600 mt-1">Thêm kho hàng mới cho dealer</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <CreateWarehouseForm />
      </div>
    </div>
  );
};

export default CreateWarehousePage;
