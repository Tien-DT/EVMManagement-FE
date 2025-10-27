import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Empty, Card, Button, Badge, Breadcrumb, message } from "antd";
import { ShoppingCartOutlined, HomeOutlined, CarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleVariants } from "../../dealer-staff/hooks/useDealerVehicleVariants";
import VehicleVariantCard from "../../dealer-staff/components/VehicleVariantCard";
import VehicleVariantDetailModal from "../../dealer-staff/components/VehicleVariantDetailModal";
import OrderCartB2B from "../components/OrderCartB2B";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import "./DealerManagerVehicleVariantsPage.css";

const DealerManagerVehicleVariantsPage = () => {
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
  const [vehicleModelName, setVehicleModelName] = useState("");

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

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("dealerManagerB2BCart", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("dealerManagerB2BCart");
    }
  }, [cartItems]);

  const { variants, loading } = useDealerVehicleVariants(dealerId, modelId);

  useEffect(() => {
    const fetchVehicleModel = async () => {
      if (modelId) {
        try {
          const response = await axiosInstance.get(endpoints.vehicleModels.getById(modelId));
          if (response.success && response.data) {
            setVehicleModelName(response.data.name);
          }
        } catch (err) {
          console.error("Error fetching vehicle model:", err);
        }
      }
    };
    fetchVehicleModel();
  }, [modelId]);

  const handleVariantClick = (variant) => {
    setSelectedVariant(variant);
    setModalVisible(true);
  };

  const handleAddVariantToCart = async (variant) => {
    let modelName = vehicleModelName || "Unknown Model";
    
    if (!vehicleModelName || vehicleModelName === "Unknown Model") {
      if (variant.modelName && variant.modelName !== "Unknown") {
        modelName = variant.modelName;
      } else if (variant.vehicleModel?.name) {
        modelName = variant.vehicleModel.name;
      } else if (variant.modelId) {
        try {
          const modelResponse = await axiosInstance.get(
            endpoints.vehicleModels.getById(variant.modelId)
          );
          if (modelResponse.success && modelResponse.data) {
            modelName = modelResponse.data.name;
          }
        } catch (err) {
          console.error("Error fetching model:", err);
        }
      }
    }
    
    const variantData = {
      vehicleId: null, 
      vin: null,
      variantId: variant.id,
      color: variant.color,
      price: variant.price,
      imageUrl: variant.imageUrl,
      engine: variant.engine,
      batteryType: variant.batteryType,
      vehicleModelName: modelName,
      quantity: 1,
    };

    setCartItems((items) => [...items, variantData]);
    setAddingToCart(true);
    setTimeout(() => setAddingToCart(false), 800);
    message.success(`Đã thêm ${modelName} vào giỏ hàng B2B`);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate("/dealer/vehicles")} style={{ cursor: "pointer" }}>
          <CarOutlined />
          <span style={{ marginLeft: 8 }}>Đặt xe từ hãng</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Biến thể xe</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dealer/vehicles")}>
              Quay lại
            </Button>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
              Danh sách biến thể xe (B2B)
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
              Giỏ hàng B2B
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
                  hidePreOrder={true}
                  isB2BMode={true}
                  onAddToB2BCart={handleAddVariantToCart}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Modal for B2B ordering - only show variant details and "Order from Manufacturer" button */}
      <VehicleVariantDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        variant={selectedVariant}
        dealerId={dealerId}
        onAddVehicleToCart={handleAddVariantToCart}
        isB2BMode={true}
      />

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

export default DealerManagerVehicleVariantsPage;
