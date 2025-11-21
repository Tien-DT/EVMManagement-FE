import React, { useEffect, useState } from "react";
import { Spin, Breadcrumb } from "antd";
import { HomeOutlined, CarOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleModels } from "../hooks/useDealerVehicleModels";
import VehicleModelCard from "../components/VehicleModelCard";

const DealerVehicleModelsPage = () => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);

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

        // Check userProfile in localStorage
        const userProfileStr = localStorage.getItem("userProfile");
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            if (userProfile.dealerId) {
              console.log("✅ Using dealerId from userProfile:", userProfile.dealerId);
              localStorage.setItem("dealerId", userProfile.dealerId);
              setDealerId(userProfile.dealerId);
              return;
            }
          } catch (err) {
            console.error("Error parsing userProfile:", err);
          }
        }

        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in localStorage");
          return;
        }

        const userData = JSON.parse(userStr);
        const accountId = userData.id || user?.id;

        if (!accountId) {
          console.error("❌ No accountId found in user");
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
          localStorage.setItem("userProfile", JSON.stringify(userProfile.data));
          setDealerId(fetchedDealerId);
        } else {
          console.error("❌ No dealerId found in user profile");
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, [user]);

  const { models, loading } = useDealerVehicleModels(dealerId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <CarOutlined />
            <span className="ml-2">Danh sách xe</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách Model Xe</h1>
          <p className="text-gray-600 mt-1">Quản lý các mẫu xe điện</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có mẫu xe nào</h3>
          <p className="text-gray-500">Chưa có mẫu xe nào trong kho</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <VehicleModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DealerVehicleModelsPage;

