import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Empty, Card, Button, Badge, Breadcrumb } from "antd";
import { ShoppingCartOutlined, HomeOutlined, CarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleVariants } from "../hooks/useDealerVehicleVariants";
import VehicleVariantCard from "../components/VehicleVariantCard";
import VehicleVariantDetailModal from "../components/VehicleVariantDetailModal";
import OrderCart from "../components/OrderCart";
import "./DealerVehicleVariantsPage.css";

const DealerVehicleVariantsPage = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

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

  useEffect(() => {
    const savedCart = localStorage.getItem("dealerCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error("Error loading cart from localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("dealerCart", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("dealerCart");
    }
  }, [cartItems]);

  const { variants, loading } = useDealerVehicleVariants(dealerId, modelId);

  const handleVariantClick = (variant) => {
    setSelectedVariant(variant);
    setModalVisible(true);
  };

  const handleAddVehicleToCart = (vehicleData) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.vehicleId === vehicleData.vehicleId);
      if (existingItem) {
        return items;
      }
      setAddingToCart(true);
      setTimeout(() => setAddingToCart(false), 800);
      return [...items, vehicleData];
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate("/dealer-staff/vehicles")} style={{ cursor: "pointer" }}>
          <CarOutlined />
          <span style={{ marginLeft: 8 }}>Danh sách xe</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Biến thể xe</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dealer-staff/vehicles")}>
              Quay lại
            </Button>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
              Danh sách biến thể xe
            </h2>
          </div>
          <Badge 
            count={cartItems.length} 
            showZero
            className={addingToCart ? 'cart-badge-bounce' : ''}
            style={{ 
              backgroundColor: '#52c41a',
              boxShadow: '0 0 0 1px #fff inset'
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartVisible(true)}
              className={addingToCart ? 'cart-button-pulse' : ''}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                fontWeight: 600
              }}
            >
              Giỏ hàng
            </Button>
          </Badge>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : variants.length === 0 ? (
          <Empty description="Không có biến thể xe nào còn hàng" />
        ) : (
          <Row gutter={[16, 16]}>
            {variants.map((variant) => (
              <Col key={variant.id} xs={24} sm={12} md={8} lg={6}>
                <VehicleVariantCard
                  variant={variant}
                  onClick={handleVariantClick}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <VehicleVariantDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        variant={selectedVariant}
        dealerId={dealerId}
        onAddVehicleToCart={handleAddVehicleToCart}
      />

      <OrderCart
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

export default DealerVehicleVariantsPage;
