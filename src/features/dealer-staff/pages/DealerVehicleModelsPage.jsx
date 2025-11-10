import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Empty, Card, Breadcrumb } from "antd";
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
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <CarOutlined />
          <span style={{ marginLeft: 8 }}>Danh sách xe</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
          Danh sách mẫu xe
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : models.length === 0 ? (
          <Empty description="Không có mẫu xe nào trong kho" />
        ) : (
          <Row gutter={[16, 16]}>
            {models.map((model) => (
              <Col key={model.id} xs={24} sm={12} md={8} lg={6}>
                <VehicleModelCard model={model} />
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default DealerVehicleModelsPage;

