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

  // Fetch dealerId and userId
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Check if dealerId already in localStorage
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          console.log("✅ Using cached dealerId:", cachedDealerId);
          setDealerId(cachedDealerId);
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
            }
            if (userProfile.id) {
              setUserId(userProfile.id);
            }
          } catch (err) {
            console.error("Error parsing userProfile:", err);
          }
        }

        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData.id && !userId) {
              setUserId(userData.id);
            }

            // If still no dealerId, fetch from API
            if (!cachedDealerId && userData.id) {
              const accountId = userData.id;
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
                
                if (userProfile.data.id) {
                  setUserId(userProfile.data.id);
                }
              } else {
                console.error("❌ No dealerId found in user profile");
              }
            }
          } catch (err) {
            console.error("Error parsing user or fetching dealerId:", err);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, []);

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

  // Debug logging
  useEffect(() => {
    console.log("🔍 DealerVehicleVariantsPage state:", {
      dealerId,
      modelId,
      variantsCount: variants.length,
      loading
    });
  }, [dealerId, modelId, variants.length, loading]);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate("/dealer-staff/vehicles")} className="cursor-pointer">
            <CarOutlined />
            <span className="ml-2">Danh sách xe</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Biến thể xe</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dealer-staff/vehicles")}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Variants</h1>
            <p className="text-gray-600 mt-1">Chọn biến thể xe để xem chi tiết</p>
          </div>
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
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : !dealerId ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải thông tin dealer...</h3>
        </div>
      ) : !modelId ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy mã model xe</h3>
        </div>
      ) : variants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có biến thể xe nào</h3>
          <p className="text-gray-500">Chưa có biến thể xe nào còn hàng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {variants.map((variant) => (
            <VehicleVariantCard
              key={variant.id}
              variant={variant}
              onClick={handleVariantClick}
              onPreOrder={handlePreOrder}
            />
          ))}
        </div>
      )}

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

