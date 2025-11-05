import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Package, MapPin, Loader2, AlertCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { useWarehouse } from "../hooks/useWarehouses";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const WarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { warehouse, isLoading, error, refreshWarehouse } = useWarehouse(id);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Fetch vehicles in warehouse
  useEffect(() => {
    if (warehouse) {
      fetchVehicles();
    }
  }, [warehouse]);

  // Auto-refresh when page becomes visible (user comes back to this tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && warehouse) {
        console.log("Page visible again - refreshing vehicles...");
        fetchVehicles();
        if (refreshWarehouse) {
          refreshWarehouse();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [warehouse, refreshWarehouse]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      console.log("🚗 Fetching vehicles for warehouse:", id);
      console.log("📍 Warehouse type:", warehouse?.type);
      
      let response;
      
      // Nếu là EVM warehouse, dùng endpoint EVM
      if (warehouse?.type === "EVM" || warehouse?.type === "evm") {
        console.log("📦 Using EVM endpoint");
        response = await axiosInstance.get(endpoints.warehouses.evm.getVehicles(id));
      } else {
        // Fallback: Dùng vehicles endpoint với warehouseId param
        console.log("📦 Using Vehicles endpoint");
        response = await axiosInstance.get(endpoints.vehicles.getAll, {
          params: { warehouseId: id, pageSize: 1000 }
        });
      }
      
      console.log("📦 API Response:", response);
      
      // Try multiple possible response structures
      let vehiclesData = [];
      if (response.data?.items) {
        vehiclesData = response.data.items;
      } else if (response.data?.data) {
        vehiclesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        vehiclesData = response.data;
      } else if (response.items) {
        vehiclesData = response.items;
      } else if (warehouse?.vehicles) {
        vehiclesData = warehouse.vehicles;
      }
      
      console.log("✅ Vehicles data:", vehiclesData);
      console.log("📊 Total vehicles:", vehiclesData.length);
      
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      console.error("❌ Error fetching vehicles:", err);
      console.error("Error details:", err.response?.data || err.message);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

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
            onClick={() => navigate("/admin/warehouses")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
        onClick={() => navigate("/admin/warehouses")}
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
          onClick={() => navigate(`/admin/warehouses/${id}/edit`)}
          className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
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

      {/* Vehicles List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="text-blue-500" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách xe trong kho
              </h2>
              <p className="text-sm text-gray-500">
                {vehicles.length} xe trong kho này
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                fetchVehicles();
                if (refreshWarehouse) refreshWarehouse();
              }}
              disabled={loadingVehicles}
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh danh sách xe"
            >
              <RefreshCw size={18} className={loadingVehicles ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            {warehouse.type === "EVM" && (
              <button
                onClick={() => navigate(`/admin/warehouses/${id}/add-vehicle`)}
                className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={18} />
                <span>Thêm xe</span>
              </button>
            )}
          </div>
        </div>

        {loadingVehicles ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có xe nào trong kho
            </h3>
            <p className="text-gray-600 mb-4">
              Thêm xe vào kho để bắt đầu quản lý
            </p>
            {warehouse.type === "EVM" && (
              <button
                onClick={() => navigate(`/admin/warehouses/${id}/add-vehicle`)}
                className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={18} />
                <span>Thêm xe đầu tiên</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Màu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mục đích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ảnh
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle) => {
                  const variant = vehicle.variant || vehicle.vehicleVariant;
                  const model = variant?.vehicleModel || vehicle.vehicleModel;
                  
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {vehicle.vin || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {model?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {variant?.color || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.status === "IN_STOCK"
                              ? "bg-green-100 text-green-800"
                              : vehicle.status === "RESERVED"
                              ? "bg-yellow-100 text-yellow-800"
                              : vehicle.status === "IN_TRANSIT"
                              ? "bg-blue-100 text-blue-800"
                              : vehicle.status === "SOLD"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vehicle.status === "IN_STOCK"
                            ? "Có sẵn"
                            : vehicle.status === "RESERVED"
                            ? "Đã đặt"
                            : vehicle.status === "IN_TRANSIT"
                            ? "Đang vận chuyển"
                            : vehicle.status === "SOLD"
                            ? "Đã bán"
                            : vehicle.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {vehicle.purpose === "FOR_SALE"
                            ? "Để bán"
                            : vehicle.purpose === "TEST_DRIVE" || vehicle.purpose === "FOR_TEST_DRIVE"
                            ? "Lái thử"
                            : vehicle.purpose || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.vin}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDetailPage;

