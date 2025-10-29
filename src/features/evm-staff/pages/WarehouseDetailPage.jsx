import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Package, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useWarehouse } from "../hooks/useWarehouses";

const WarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { warehouse, isLoading, error } = useWarehouse(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin kho hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy kho hàng
          </h3>
          <p className="text-gray-600 mb-4">{error || "Kho hàng không tồn tại"}</p>
          <button
            onClick={() => navigate("/evm-staff/warehouses")}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const capacityPercentage = warehouse.capacity
    ? ((warehouse.currentStock || 0) / warehouse.capacity) * 100
    : 0;

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate("/evm-staff/warehouses")}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Warehouses</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
          <p className="text-gray-600 mt-1">Chi tiết kho hàng</p>
        </div>
        <button
          onClick={() => navigate(`/evm-staff/warehouses/${id}/edit`)}
          className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Edit size={20} />
          <span>Edit</span>
        </button>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tên kho</label>
              <p className="text-gray-900 font-medium">{warehouse.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Loại</label>
              <p className="text-gray-900">{warehouse.type || "DEALER"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                <MapPin size={16} />
                <span>Địa chỉ</span>
              </label>
              <p className="text-gray-900 mt-1">{warehouse.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sức chứa
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-500">
                  Sức chứa hiện tại
                </label>
                <span className="text-lg font-bold text-gray-900">
                  {warehouse.currentStock || 0} / {warehouse.capacity || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${getCapacityColor(
                    capacityPercentage
                  )}`}
                  style={{
                    width: `${Math.min(capacityPercentage, 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {capacityPercentage.toFixed(1)}% đã sử dụng
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Tổng sức chứa
              </label>
              <p className="text-2xl font-bold text-gray-900">
                {warehouse.capacity || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin bổ sung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-gray-900 font-mono text-sm">{warehouse.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Dealer ID</label>
            <p className="text-gray-900 font-mono text-sm">
              {warehouse.dealerId || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900">{warehouse.status || "active"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetailPage;

