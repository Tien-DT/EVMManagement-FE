import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Empty, Card, Breadcrumb } from "antd";
import { HomeOutlined, CarOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleModels } from "../hooks/useDealerVehicleModels";
import VehicleModelCard from "../components/VehicleModelCard";

const DealerVehicleModelsPage = () => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);

  useEffect(() => {
    const userProfileStr = localStorage.getItem("userProfile");
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        setDealerId(userProfile.dealerId);
      } catch (err) {
        console.error("Error parsing userProfile:", err);
      }
    }
  }, []);

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

