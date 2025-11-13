import React, { useEffect, useState, useMemo } from "react";
import { Spin, Breadcrumb, Badge, Button, Input } from "antd";
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <CarOutlined />
            <span className="ml-2">Đặt xe từ hãng</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách mẫu xe (B2B)</h1>
          <p className="text-gray-600 mt-1">Chọn mẫu xe để xem các biến thể</p>
        </div>
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

      <div className="mb-6">
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
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Không tìm thấy mẫu xe phù hợp" : "Không có mẫu xe nào trong kho"}
          </h3>
          <p className="text-gray-500">Vui lòng thử lại sau</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <VehicleModelCard key={model.id} model={model} basePath="/dealer/vehicles" />
          ))}
        </div>
      )}

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

