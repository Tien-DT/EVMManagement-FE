// src/features/dealer-staff/pages/VehicleModelsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, Loader2, AlertCircle, Calendar } from "lucide-react";
import { vehicleService } from "../services/vehicleService";

const VehicleModelsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerId, setDealerId] = useState(null);

  // Fetch dealerId from sessionStorage or API
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Check if dealerId already in sessionStorage
        const cachedDealerId = sessionStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
          return;
        }

        // Get user from sessionStorage
        const userStr = sessionStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in sessionStorage");
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

          // Save to sessionStorage for future use
          sessionStorage.setItem("dealerId", fetchedDealerId);
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

  // Fetch vehicle models by dealer
  useEffect(() => {
    const fetchModels = async () => {
      if (!dealerId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("🚗 Fetching models for dealer:", dealerId);
        const response = await vehicleService.getModelsByDealer(dealerId);
        
        if (response.success && response.data) {
          console.log("✅ Models fetched:", response.data);
          // Check if data is paginated or direct array
          const modelsList = response.data.items || response.data;
          setModels(modelsList);
        } else {
          throw new Error(response.message || "Không thể tải danh sách model xe");
        }
      } catch (error) {
        console.error("❌ Error fetching models:", error);
        setError(error.message || "Có lỗi xảy ra khi tải danh sách model xe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [dealerId]);

  // Filter models based on search
  const filteredModels = models.filter((model) =>
    model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-600">Đang tải danh sách model xe...</p>
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
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Model Xe</h1>
          <p className="text-gray-600 mt-1">
            Chọn model xe để xem các phiên bản (variant)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã model xe..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => navigate(`/dealer-staff/vehicles/models/${model.id}/variants`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              {/* Model Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
                {model.imageUrl ? (
                  <img
                    src={model.imageUrl}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car size={64} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Model Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {model.name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Mã: {model.code || "N/A"}
                    </p>
                  </div>
                  {model.ranking && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {model.ranking}
                    </span>
                  )}
                </div>

                {model.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {model.description}
                  </p>
                )}

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {model.launchDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span>Ra mắt: {formatDate(model.launchDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Car size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy model xe
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Thử điều chỉnh từ khóa tìm kiếm"
                  : "Chưa có model xe nào trong kho"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleModelsPage;
