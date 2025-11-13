import React, { useState, useEffect } from "react";
import { Spin, Button, Badge, Breadcrumb, message } from "antd";
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
    const userProfileStr = localStorage.getItem("userProfile");
    const userStr = localStorage.getItem("user");

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate("/dealer/vehicles")} className="cursor-pointer">
            <CarOutlined />
            <span className="ml-2">Đặt xe từ hãng</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Biến thể xe</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dealer/vehicles")}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách biến thể xe (B2B)</h1>
            <p className="text-gray-600 mt-1">Chọn biến thể xe để đặt từ hãng</p>
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
            Giỏ hàng B2B
          </Button>
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
          <span className="ml-3 text-gray-600">Loading...</span>
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
              hidePreOrder={true}
              isB2BMode={true}
              onAddToB2BCart={handleAddVariantToCart}
            />
          ))}
        </div>
      )}

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

