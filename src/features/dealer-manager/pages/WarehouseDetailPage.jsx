import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  Info,
  AlertCircle,
  Loader2,
  Car,
  Edit,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const WarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWarehouseDetail();
  }, [id]);

  const fetchWarehouseDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get(endpoints.warehouses.getById(id));
      
      console.log("Warehouse detail response:", response);

      if (response.data?.success && response.data?.data) {
        setWarehouse(response.data.data);
      } else if (response.data) {
        // Sometimes API returns data directly
        setWarehouse(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching warehouse detail:", err);
      setError(err.response?.data?.message || err.message || "Failed to load warehouse details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCapacityPercentage = (current, total) => {
    if (!total) return 0;
    return (current / total) * 100;
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kho hàng này?")) {
      try {
        await axiosInstance.delete(endpoints.warehouses.delete(id));
        alert("Xóa kho hàng thành công!");
        navigate("/dealer-manager/warehouses");
      } catch (err) {
        console.error("Error deleting warehouse:", err);
        alert(err.response?.data?.message || "Xóa kho hàng thất bại!");
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin kho hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dealer-manager/warehouses")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={fetchWarehouseDetail}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy kho hàng
          </h3>
          <button
            onClick={() => navigate("/dealer-manager/warehouses")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const currentStock = warehouse.vehicles?.length || 0;
  const capacityPercentage = getCapacityPercentage(currentStock, warehouse.capacity || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dealer-manager/warehouses")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết kho hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Thông tin chi tiết về kho hàng
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dealer-manager/warehouses/${id}/edit`)}
            className="inline-flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            <Edit size={20} />
            <span>Chỉnh sửa</span>
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            <Trash2 size={20} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {warehouse.name || "N/A"}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin size={18} />
                <span>{warehouse.address || "N/A"}</span>
              </div>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              warehouse.status || "active"
            )}`}
          >
            {warehouse.status || "active"}
          </span>
        </div>

        {/* Capacity Progress */}
        <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold">Sức chứa</span>
            <span className="text-2xl font-bold">
              {currentStock} / {warehouse.capacity || 0}
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${getCapacityColor(
                capacityPercentage
              )}`}
              style={{
                width: `${Math.min(capacityPercentage, 100)}%`,
              }}
            />
          </div>
          <p className="text-white/90 text-sm mt-2">
            {capacityPercentage.toFixed(1)}% đã sử dụng
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Type */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-600">Loại kho</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {warehouse.type || "DEALER"}
          </p>
        </div>

        {/* Organization */}
        {warehouse.organization && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Tổ chức</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {warehouse.organization}
            </p>
          </div>
        )}

        {/* Created Date */}
        {warehouse.createdDate && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Ngày tạo</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {moment(warehouse.createdDate).format("DD/MM/YYYY")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {moment(warehouse.createdDate).format("HH:mm:ss")}
            </p>
          </div>
        )}

        {/* Updated Date */}
        {warehouse.updatedDate && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Cập nhật lần cuối</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {moment(warehouse.updatedDate).format("DD/MM/YYYY")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {moment(warehouse.updatedDate).format("HH:mm:ss")}
            </p>
          </div>
        )}
      </div>

      {/* Vehicles List */}
      {warehouse.vehicles && warehouse.vehicles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách xe trong kho ({warehouse.vehicles.length})
                </h3>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    STT
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    VIN
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Biến thể
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Trạng thái
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Mục đích
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {warehouse.vehicles.map((vehicle, index) => (
                  <tr key={vehicle.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {vehicle.vin || "N/A"}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563' }}>
                      {vehicle.variantName || vehicle.vehicleVariantId || "N/A"}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        {vehicle.status || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563' }}>
                      {vehicle.purpose || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty vehicles state */}
      {(!warehouse.vehicles || warehouse.vehicles.length === 0) && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12">
          <div className="text-center">
            <Car size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có xe trong kho
            </h3>
            <p className="text-gray-600">
              Kho hàng hiện tại chưa có xe nào
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
