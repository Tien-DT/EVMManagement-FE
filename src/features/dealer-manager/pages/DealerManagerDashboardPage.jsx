import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  message,
  Tag,
  Spin,
  Select,
  Badge,
} from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useDealerManagerOrders } from "../hooks/useDealerManagerOrders";
import OrderCartB2B from "../components/OrderCartB2B";
import OrderDetailModal from "../components/OrderDetailModal";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Option } = Select;

const DealerManagerDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const statusConfig = {
    CONFIRMED: {
      color: "#1890ff",
      text: "Đã xác nhận",
    },
    AWAITING_DEPOSIT: {
      color: "#fa8c16",
      text: "Chờ đặt cọc / Chờ báo giá",
    },
    IN_PROGRESS: {
      color: "#52c41a",
      text: "Đang xử lý",
    },
    READY_FOR_HANDOVER: {
      color: "#13c2c2",
      text: "Sẵn sàng bàn giao",
    },
    COMPLETED: {
      color: "#52c41a",
      text: "Hoàn thành",
    },
    CANCELED: {
      color: "#ff4d4f",
      text: "Đã hủy",
    },
  };

  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.log("No user.id found");
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        if (response.success && response.data) {
          const userDealerId = response.data.dealerId;
          const userProfileId = response.data.id;

          if (userDealerId) {
            setDealerId(userDealerId);
            setUserId(userProfileId);
          } else {
            console.error("No dealerId in profile");
            message.error("Không tìm thấy dealerId trong profile");
          }
        } else {
          message.error("Không tìm thấy thông tin dealer");
        }
      } catch (error) {
        message.error("Lỗi khi lấy thông tin dealer: " + error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

  useEffect(() => {
    const savedCart = localStorage.getItem("dealerManagerB2BCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (err) {
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

  const {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    changePage,
  } = useDealerManagerOrders(dealerId);

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedOrderId(null);
  };

  const handleAddPreOrderToCart = async (order) => {
    console.log("🛒 Adding order to cart:", order);
    
    try {
      message.loading({ content: "Đang tải thông tin xe...", key: "addCart" });
      
      let orderWithDetails = null;
      try {
        const orderResponse = await axiosInstance.get(
          endpoints.orders.getByIdWithDetails(order.id)
        );
        
        if (orderResponse.success && orderResponse.data) {
          orderWithDetails = orderResponse.data;
        }
      } catch (err) {
        message.error({ content: "Không thể tải chi tiết đơn hàng", key: "addCart" });
        return;
      }

      if (!orderWithDetails || !orderWithDetails.orderDetails || orderWithDetails.orderDetails.length === 0) {
        message.warning({ content: "Đơn hàng này không có chi tiết sản phẩm", key: "addCart" });
        return;
      }

      const orderDetails = orderWithDetails.orderDetails;

      const newItems = [];
      for (const detail of orderDetails) {
        if (detail.vehicleId) {
          try {
            const vehicleResponse = await axiosInstance.get(
              endpoints.vehicles.getById(detail.vehicleId)
            );
                        
            if (vehicleResponse.success && vehicleResponse.data) {
              const vehicle = vehicleResponse.data;
              const variant = vehicle.vehicleVariant;
              
              if (variant) {
                newItems.push({
                  vehicleId: vehicle.id,
                  vin: vehicle.vin,
                  variantId: variant.id,
                  color: variant.color,
                  price: variant.price,
                  imageUrl: variant.imageUrl,
                  engine: variant.engine,
                  batteryType: variant.batteryType,
                });
              }
            }
          } catch (err) {
            console.error("Error fetching vehicle:", err);
          }
        } else if (detail.vehicleVariantId) {
          try {
            const variantResponse = await axiosInstance.get(
              endpoints.vehicleVariants.getById(detail.vehicleVariantId)
            );
            
            if (variantResponse.success && variantResponse.data) {
              const variant = variantResponse.data;
              
              let modelName = "Unknown Model";
              
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
              
              newItems.push({
                vehicleId: null, 
                vin: null, 
                variantId: variant.id,
                color: variant.color,
                price: variant.price,
                imageUrl: variant.imageUrl,
                engine: variant.engine,
                batteryType: variant.batteryType,
                vehicleModelName: modelName,
                quantity: detail.quantity || 1, 
              });
            }
          } catch (err) {
            console.error("Error fetching variant:", err);
          }
        }
      }

      if (newItems.length > 0) {
        setCartItems((items) => {
          const existingIds = items.map(item => item.vehicleId);
          const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.vehicleId));
          
          if (uniqueNewItems.length === 0) {
            message.warning({ content: "Các xe này đã có trong giỏ hàng", key: "addCart" });
            return items;
          }
          
          const updatedCart = [...items, ...uniqueNewItems];          
          message.success({ content: `Đã thêm ${uniqueNewItems.length} xe vào giỏ hàng B2B`, key: "addCart" });
          return updatedCart;
        });
      } else {
        message.warning({ content: "Không có xe nào được thêm vào giỏ hàng", key: "addCart" });
      }
    } catch (error) {
      message.error({ content: "Lỗi khi thêm xe vào giỏ hàng", key: "addCart" });
    }
  };

  const filteredOrders = orderTypeFilter === "ALL" 
    ? orders 
    : orders.filter(order => {
        if (orderTypeFilter === "B2C") return order.orderType === 0;
        if (orderTypeFilter === "B2B") return order.orderType === 1;
        if (orderTypeFilter === "B2C_P") return order.orderType === 2;
        return true;
      });

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1890ff", fontSize: "13px" }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 160,
      ellipsis: true,
      render: (_, record) => {
        return record.customer?.fullName || <span style={{ color: "#999" }}>N/A</span>;
      },
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "orderType",
      width: 110,
      align: "center",
      render: (orderType) => {
        if (orderType === 2 || orderType === "B2C_P") {
          return <Tag color="orange" style={{ fontWeight: 500 }}>Đặt trước</Tag>;
        } else if (orderType === 1 || orderType === "B2B") {
          return <Tag color="blue" style={{ fontWeight: 500 }}>B2B</Tag>;
        } else {
          return <Tag color="green" style={{ fontWeight: 500 }}>B2C</Tag>;
        }
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      align: "right",
      render: (amount) => (
        <span style={{ fontWeight: 500 }}>
          {amount ? `${amount.toLocaleString()}` : "0"}
        </span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      width: 140,
      align: "right",
      render: (amount) => (
        <span style={{ fontWeight: 600, color: "#52c41a", fontSize: "14px" }}>
          {amount ? `${amount.toLocaleString()}` : "0"}
        </span>
      ),
    },
    {
      title: "Ngày giao",
      dataIndex: "expectedDeliveryAt",
      key: "expectedDeliveryAt",
      width: 110,
      render: (date) => (
        <span style={{ fontSize: "13px" }}>
          {date ? moment(date).format("DD/MM/YYYY") : "N/A"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.CONFIRMED;
        return (
          <Tag color={config.color} style={{ fontWeight: 500 }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space size={4} wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
            size="small"
            style={{ color: "#1890ff", padding: "4px 8px" }}
          >
            Xem
          </Button>
          {record.orderType === 2 && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleAddPreOrderToCart(record)}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              Giỏ B2B
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loadingProfile) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>
            Đang tải thông tin dealer...
          </p>
        </div>
      </Card>
    );
  }

  if (!dealerId) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "#ff4d4f", fontSize: "16px", fontWeight: 500 }}>
            Không tìm thấy thông tin dealer
          </p>
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px" }}
          >
            Tải lại trang
          </Button>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "#ff4d4f", fontSize: "16px", fontWeight: 500 }}>
            Lỗi: {error}
          </p>
          <Button
            type="primary"
            onClick={refreshOrders}
            style={{ marginTop: "16px" }}
          >
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="dealer-dashboard">
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              Quản lý đơn hàng Dealer
            </span>
            <Space>
              <Select
                value={orderTypeFilter}
                onChange={setOrderTypeFilter}
                style={{ width: 150 }}
              >
                <Option value="ALL">Tất cả</Option>
                <Option value="B2C">B2C</Option>
                <Option value="B2B">B2B</Option>
                <Option value="B2C_P">Đặt trước</Option>
              </Select>
              <Badge count={cartItems.length} showZero>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setCartVisible(true)}
                  size="large"
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    fontWeight: 600,
                  }}
                >
                  Giỏ B2B
                </Button>
              </Badge>
            </Space>
          </div>
        }
        styles={{ body: { padding: "16px" } }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "16px", color: "#666" }}>
              Đang tải dữ liệu...
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1400 }}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.totalItems,
              showSizeChanger: false,
              onChange: changePage,
              showTotal: (total) => (
                <span style={{ fontWeight: 500 }}>
                  Tổng <span style={{ color: "#1890ff" }}>{total}</span> đơn hàng
                </span>
              ),
              style: { marginTop: "16px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px" }}>
                  <p style={{ fontSize: "16px", color: "#999" }}>
                    Không có dữ liệu đơn hàng
                  </p>
                </div>
              ),
            }}
            size="middle"
          />
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

      <OrderDetailModal
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default DealerManagerDashboardPage;
