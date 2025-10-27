import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Empty, Card, Breadcrumb, Badge, Button } from "antd";
import { HomeOutlined, CarOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleModels } from "../../dealer-staff/hooks/useDealerVehicleModels";
import VehicleModelCard from "../../dealer-staff/components/VehicleModelCard";
import OrderCartB2B from "../components/OrderCartB2B";

const DealerManagerVehicleModelsPage = () => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const userProfileStr = sessionStorage.getItem("userProfile");
    const userStr = sessionStorage.getItem("user");

    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        setDealerId(userProfile.dealerId);
        setUserId(userProfile.id);
      } catch (err) {
        console.error("Error parsing userProfile:", err);
      }
    }

    if (!userId && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserId(userData.id);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, [userId]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("dealerManagerB2BCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error("Error loading cart from localStorage:", err);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("dealerManagerB2BCart", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("dealerManagerB2BCart");
    }
  }, [cartItems]);

  const { models, loading } = useDealerVehicleModels(dealerId);

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <CarOutlined />
          <span style={{ marginLeft: 8 }}>Đặt xe từ hãng</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            Danh sách mẫu xe (B2B)
          </h2>
          <Badge count={cartItems.length} showZero>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartVisible(true)}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                fontWeight: 600
              }}
            >
              Giỏ hàng B2B
            </Button>
          </Badge>
        </div>

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
                <VehicleModelCard model={model} basePath="/dealer/vehicles" />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <OrderCartB2B
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        dealerId={dealerId}
        userId={userId}
      />
    </div>
  );
};

export default DealerManagerVehicleModelsPage;
