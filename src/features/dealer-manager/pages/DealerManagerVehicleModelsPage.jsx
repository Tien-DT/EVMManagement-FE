import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spin, Empty, Card, Breadcrumb, Badge, Button, Input } from "antd";
import { HomeOutlined, CarOutlined, ShoppingCartOutlined, SearchOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleModels } from "../../dealer-staff/hooks/useDealerVehicleModels";
import VehicleModelCard from "../../dealer-staff/components/VehicleModelCard";
import OrderCartB2B from "../components/OrderCartB2B";

const { Search } = Input;

const DealerManagerVehicleModelsPage = () => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("=== DealerManagerVehicleModelsPage Debug ===");
    console.log("user from AuthContext:", user);
    
    // Prioritize dealerId from AuthContext
    if (user?.dealerId) {
      console.log("✅ Found dealerId from AuthContext:", user.dealerId);
      setDealerId(user.dealerId);
      setUserId(user.id || user.userProfileId);
      return; // Exit early if we got dealerId from context
    }

    // Fallback to localStorage
    const userProfileStr = localStorage.getItem("userProfile");
    const userStr = localStorage.getItem("user");

    console.log("userProfile from localStorage:", userProfileStr);
    console.log("user from localStorage:", userStr);

    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        console.log("Parsed userProfile:", userProfile);
        console.log("dealerId from userProfile:", userProfile.dealerId);
        setDealerId(userProfile.dealerId);
        setUserId(userProfile.id);
      } catch (err) {
        console.error("Error parsing userProfile:", err);
      }
    }

    if (!userId && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log("Parsed user:", userData);
        setUserId(userData.id);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, [user, userId]);

  console.log("Current state - dealerId:", dealerId, "userId:", userId);

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

  // Filter models
  const filteredModels = useMemo(() => {
    if (!searchTerm) return models;
    return models.filter(model => 
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [models, searchTerm]);

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
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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

          {/* Search Filter */}
          <Search
            placeholder="Tìm kiếm mẫu xe theo tên..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : filteredModels.length === 0 ? (
          <Empty description={searchTerm ? "Không tìm thấy mẫu xe phù hợp" : "Không có mẫu xe nào trong kho"} />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredModels.map((model) => (
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

