// src/features/dealer-staff/pages/VehicleDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Car,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Plus,
} from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { useCart } from "../../../context/CartContext";
import { useNotification } from "../../../context/NotificationContext";

const VehicleDetailPage = () => {
  const navigate = useNavigate();
  const { modelId, variantId } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [variant, setVariant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerId, setDealerId] = useState(null);
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();

  // Fetch dealerId from localStorage or API
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Check if dealerId already in localStorage
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
          return;
        }

        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in localStorage");
          setError("Không tìm thấy thông tin người dùng");
          return;
        }

        const user = JSON.parse(userStr);
        const accountId = user.id;

        if (!accountId) {
          console.error("❌ No accountId found in user");
          setError("Không tìm thấy ID tài khoản");
          return;
        }

        console.log("🔍 Fetching dealerId for accountId:", accountId);

        // Import dealerService dynamically
        const { dealerService } = await import(
          "../../dealer-manager/services/dealerService"
        );

        // Fetch user profile to get dealerId
        const userProfile = await dealerService.getUserProfile(accountId);
        console.log("📦 User profile response:", userProfile);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log("✅ DealerId fetched from API:", fetchedDealerId);

          // Save to localStorage for future use
          localStorage.setItem("dealerId", fetchedDealerId);
          setDealerId(fetchedDealerId);
        } else {
          console.error("❌ No dealerId found in user profile");
          setError("Không tìm thấy thông tin dealer");
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
        setError("Có lỗi khi tải thông tin dealer");
      }
    };

    fetchDealerId();
  }, []);

  // Fetch variant info
  useEffect(() => {
    const fetchVariant = async () => {
      if (!variantId) return;

      try {
        console.log("🔍 Fetching variant info:", variantId);
        
        // Import axios to call variant API
        const axiosInstance = (await import("../../../api/axiosInstance")).default;
        const response = await axiosInstance.get(`/v1/VehicleVariants/${variantId}`);
        
        if (response.success && response.data) {
          console.log("✅ Variant fetched:", response.data);
          setVariant(response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching variant:", error);
      }
    };

    fetchVariant();
  }, [variantId]);

  // Fetch vehicles when dealerId and variantId are available
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!dealerId || !variantId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "🚗 Fetching vehicles for dealer:",
          dealerId,
          "and variant:",
          variantId
        );
        const response = await vehicleService.getVehiclesByDealerAndVariant(
          dealerId,
          variantId
        );

        if (response.success && response.data) {
          console.log("✅ Vehicles fetched:", response.data);
          // Check if data is paginated or direct array
          const vehiclesList = response.data.items || response.data;
          setVehicles(vehiclesList);
        } else {
          throw new Error(
            response.message || "Không thể tải danh sách xe"
          );
        }
      } catch (error) {
        console.error("❌ Error fetching vehicles:", error);
        setError(error.message || "Có lỗi xảy ra khi tải danh sách xe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [dealerId, variantId]);

  const handleAddToCart = (vehicle) => {
    if (!variant) {
      showError("Không thể thêm vào giỏ hàng. Thiếu thông tin variant.");
      return;
    }

    if (vehicle.status !== "IN_STOCK") {
      showError("Chỉ có thể thêm xe đang trong kho vào giỏ hàng.");
      return;
    }

    const result = addToCart(vehicle, variant, modelId);
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: {
        label: "Có sẵn",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800",
      },
      SOLD: {
        label: "Đã bán",
        icon: XCircle,
        className: "bg-red-100 text-red-800",
      },
      RESERVED: {
        label: "Đã đặt",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800",
      },
      IN_TRANSIT: {
        label: "Đang vận chuyển",
        icon: Package,
        className: "bg-blue-100 text-blue-800",
      },
      MAINTENANCE: {
        label: "Bảo trì",
        icon: AlertCircle,
        className: "bg-orange-100 text-orange-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      icon: AlertCircle,
      className: "bg-gray-100 text-gray-800",
    };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách xe...</p>
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
          <button
            onClick={() => navigate(`/dealer-staff/vehicles/models/${modelId}/variants`)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại danh sách variant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(`/dealer-staff/vehicles/models/${modelId}/variants`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Quay lại danh sách variant</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách Xe Cụ Thể
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng số {vehicles.length} xe có sẵn cho variant này
          </p>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {vehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày sản xuất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày nhập kho
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.vin || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {vehicle.warehouseName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formatDate(vehicle.manufactureDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formatDate(vehicle.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleAddToCart(vehicle)}
                        disabled={vehicle.status !== "IN_STOCK"}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          vehicle.status === "IN_STOCK"
                            ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        title={
                          vehicle.status === "IN_STOCK"
                            ? "Thêm vào giỏ hàng"
                            : "Xe không trong kho"
                        }
                      >
                        <Plus size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có xe nào
            </h3>
            <p className="text-gray-600 mb-4">
              Variant này chưa có xe nào trong kho
            </p>
            <button
              onClick={() => navigate(`/dealer-staff/vehicles/models/${modelId}/variants`)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Quay lại danh sách variant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailPage;

