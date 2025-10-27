import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Spin, Empty, Card, Button, Badge, Breadcrumb, message } from "antd";
import { ShoppingCartOutlined, HomeOutlined, CarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useDealerVehicleVariants } from "../hooks/useDealerVehicleVariants";
import VehicleVariantCard from "../components/VehicleVariantCard";
import VehicleVariantDetailModal from "../components/VehicleVariantDetailModal";
import PreOrderModal from "../components/PreOrderModal";
import OrderCart from "../components/OrderCart";
import { orderService } from "../services/orderService";
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
  const [preOrderModalVisible, setPreOrderModalVisible] = useState(false);
  const [preOrderVariant, setPreOrderVariant] = useState(null);
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

  const dedupeCartItems = useCallback((items = []) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = item?.vehicleId ?? `${item?.variantId || "variant"}-${item?.vin || "no-vin"}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem("dealerCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(dedupeCartItems(parsedCart));
      } catch (err) {
        console.error("Error loading cart from localStorage:", err);
      }
    }
  }, [dedupeCartItems]);

  useEffect(() => {
    const deduped = dedupeCartItems(cartItems);
    if (deduped.length !== cartItems.length) {
      setCartItems(deduped);
      return;
    }

    if (deduped.length > 0) {
      localStorage.setItem("dealerCart", JSON.stringify(deduped));
    } else {
      localStorage.removeItem("dealerCart");
    }
  }, [cartItems, dedupeCartItems]);

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
      return dedupeCartItems([...items, vehicleData]);
    });
  };

  const handlePreOrder = (variant) => {
    setPreOrderVariant(variant);
    setPreOrderModalVisible(true);
  };

  const handlePreOrderSuccess = async (preOrderData) => {
    try {
      // Add dealer and user info to pre-order data
      const completePreOrderData = {
        ...preOrderData,
        dealerId: dealerId,
        createdByUserId: userId,
        price: preOrderVariant.price,
      };
      
      const result = await orderService.createPreOrder(completePreOrderData);
      
      // Check if result exists and has success flag
      if (result && result.success === true) {
        // Close modal first
        setPreOrderModalVisible(false);
        
        // Then show success message with order details
        const orderCode = result.order?.code || result.order?.id || 'N/A';
        const successMessage = `✅ Đặt trước thành công! Mã đơn hàng: ${orderCode}. Đã đặt cọc 10%.`;
        
        message.success({
          content: successMessage,
          duration: 6,
          style: {
            marginTop: '20vh',
            fontSize: '16px',
          },
        });
        
        // Optionally reload variants to update stock status
        // window.location.reload();
      } else {
        throw new Error("Không nhận được kết quả thành công từ server");
      }
      
      // Return the result to the modal
      return result;
    } catch (error) {
      console.error("Pre-order error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt trước";
      message.error(errorMessage, 5);
      throw error;
    }
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
                  onPreOrder={handlePreOrder}
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

      <PreOrderModal
        visible={preOrderModalVisible}
        onClose={() => setPreOrderModalVisible(false)}
        variant={preOrderVariant}
        dealerId={dealerId}
        onSuccess={handlePreOrderSuccess}
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
