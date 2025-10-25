// src/features/dealer-staff/pages/VehicleVariantsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Car, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  Gauge, 
  Battery, 
  Package 
} from "lucide-react";
import { vehicleService } from "../services/vehicleService";

const VehicleVariantsPage = () => {
  const navigate = useNavigate();
  const { modelId } = useParams();
  const [dealerId, setDealerId] = useState(null);
  const [variants, setVariants] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get dealerId from sessionStorage
  useEffect(() => {
    const cachedDealerId = sessionStorage.getItem("dealerId");
    if (cachedDealerId) {
      setDealerId(cachedDealerId);
    } else {
      console.error("❌ No dealerId found in sessionStorage");
      navigate("/dealer-staff/vehicles/models");
    }
  }, [navigate]);

  // Fetch variants when dealerId and modelId are available
  useEffect(() => {
    const fetchVariants = async () => {
      if (!dealerId || !modelId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔧 Fetching variants for dealer:", dealerId, "model:", modelId);
        const response = await vehicleService.getVariantsByDealerAndModel(
          dealerId,
          modelId
        );

        if (response.success && response.data) {
          console.log("✅ Variants fetched:", response.data);
          setVariants(response.data);
          
          // Extract model info from first variant if available
          if (response.data.length > 0) {
            const firstVariant = response.data[0];
            setModelInfo({
              modelName: firstVariant.modelName,
              modelCode: firstVariant.modelCode,
            });
          }
        } else {
          throw new Error(response.message || "Không thể tải danh sách variant");
        }
      } catch (error) {
        console.error("❌ Error fetching variants:", error);
        setError(error.message || "Có lỗi xảy ra khi tải danh sách variant");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [dealerId, modelId]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách variant...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dealer-staff/vehicles/models")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại danh sách model
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
          onClick={() => navigate("/dealer-staff/vehicles/models")}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Quay lại danh sách model</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {modelInfo?.modelName || "Danh sách Variant"}
          </h1>
          <p className="text-gray-600 mt-1">
            {modelInfo?.modelCode && `Mã model: ${modelInfo.modelCode} • `}
            Chọn variant để xem chi tiết
          </p>
        </div>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {variants.length > 0 ? (
          variants.map((variant) => (
            <div
              key={variant.variantId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Variant Image */}
              <div className="relative h-56 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
                {variant.imageUrl ? (
                  <img
                    src={variant.imageUrl}
                    alt={variant.color || "Variant"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car size={80} className="text-gray-300" />
                  </div>
                )}
                {variant.color && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white rounded-full shadow-lg">
                    <span className="text-sm font-medium">{variant.color}</span>
                  </div>
                )}
              </div>

              {/* Variant Info */}
              <div className="p-6">
                {/* Price */}
                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <DollarSign size={16} className="mr-1" />
                      <span>Giá bán</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(variant.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Package size={16} className="mr-1" />
                      <span>Tồn kho</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {variant.availableQuantity || 0}
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Thông số kỹ thuật
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {variant.engine && (
                      <div className="flex items-start space-x-2">
                        <Gauge size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Động cơ</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.engine}
                          </p>
                        </div>
                      </div>
                    )}

                    {variant.batteryType && (
                      <div className="flex items-start space-x-2">
                        <Battery size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Pin</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.batteryType}
                          </p>
                        </div>
                      </div>
                    )}

                    {variant.maximumSpeed && (
                      <div className="flex items-start space-x-2">
                        <Gauge size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Tốc độ tối đa</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.maximumSpeed} km/h
                          </p>
                        </div>
                      </div>
                    )}

                    {variant.distancePerCharge && (
                      <div className="flex items-start space-x-2">
                        <Battery size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Quãng đường</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.distancePerCharge}
                          </p>
                        </div>
                      </div>
                    )}

                    {variant.chargingTime && (
                      <div className="flex items-start space-x-2">
                        <Battery size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Thời gian sạc</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.chargingTime} giờ
                          </p>
                        </div>
                      </div>
                    )}

                    {variant.weight && (
                      <div className="flex items-start space-x-2">
                        <Package size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Trọng lượng</p>
                          <p className="text-sm font-medium text-gray-900">
                            {variant.weight} kg
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {variant.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {variant.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Car size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có variant nào
              </h3>
              <p className="text-gray-600 mb-4">
                Model này chưa có variant nào trong kho
              </p>
              <button
                onClick={() => navigate("/dealer-staff/vehicles/models")}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Quay lại danh sách model
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleVariantsPage;
