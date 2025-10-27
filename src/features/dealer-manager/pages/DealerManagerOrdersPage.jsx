// src/features/dealer-manager/pages/DealerManagerOrdersPage.jsx
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
  Popconfirm,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  RocketOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useDealerManagerOrders } from "../hooks/useDealerManagerOrders";
import OrderCartB2B from "../components/OrderCartB2B";
import OrderDetailModal from "../components/OrderDetailModal";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Option } = Select;

const DealerManagerOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState("ALL");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const statusConfig = {
    CONFIRMED: {
      color: "#1890ff",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
      text: "Đã xác nhận",
      icon: <CheckCircleOutlined />,
    },
    AWAITING_DEPOSIT: {
      color: "#fa8c16",
      bgColor: "#fff7e6",
      borderColor: "#ffd591",
      text: "Chờ đặt cọc / Chờ báo giá",
      icon: <ClockCircleOutlined />,
    },
    IN_PROGRESS: {
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
      text: "Đang xử lý",
      icon: <SyncOutlined spin />,
    },
    READY_FOR_HANDOVER: {
      color: "#13c2c2",
      bgColor: "#e6fffb",
      borderColor: "#87e8de",
      text: "Sẵn sàng bàn giao",
      icon: <RocketOutlined />,
    },
    COMPLETED: {
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
      text: "Hoàn thành",
      icon: <CheckCircleOutlined />,
    },
    CANCELED: {
      color: "#ff4d4f",
      bgColor: "#fff1f0",
      borderColor: "#ffccc7",
      text: "Đã hủy",
      icon: <StopOutlined />,
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
        console.log("Fetching user profile for user.id:", user.id);
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        console.log("User profile response:", response);

        if (response.success && response.data) {
          const userDealerId = response.data.dealerId;
          const userProfileId = response.data.id;
          console.log("Found dealerId from profile:", userDealerId);
          console.log("Found userId from profile:", userProfileId);

          if (userDealerId) {
            setDealerId(userDealerId);
            setUserId(userProfileId);
          } else {
            console.error("No dealerId in profile");
            message.error("Không tìm thấy dealerId trong profile");
          }
        } else {
          console.error("Profile API unsuccessful:", response);
          message.error("Không tìm thấy thông tin dealer");
        }
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
        message.error("Lỗi khi lấy thông tin dealer: " + error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

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

  const {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    changePage,
  } = useDealerManagerOrders(dealerId);

  const handleStatusChange = async (orderId, newStatus, currentOrder) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));

    try {
      const updateData = {
        code: currentOrder.code,
        quotationId: currentOrder.quotationId,
        customerId: currentOrder.customerId,
        dealerId: currentOrder.dealerId,
        createdByUserId: currentOrder.createdByUserId,
        status: newStatus,
        totalAmount: currentOrder.totalAmount,
        discountAmount: currentOrder.discountAmount || 0,
        finalAmount: currentOrder.finalAmount,
        expectedDeliveryAt: currentOrder.expectedDeliveryAt,
        orderType: currentOrder.orderType,
        isFinanced: currentOrder.isFinanced || false,
      };

      console.log("📤 Updating order status:", {
        orderId,
        newStatus,
        updateData,
      });

      const response = await axiosInstance.put(
        endpoints.orders.update(orderId),
        updateData
      );

      console.log("📥 Update response:", response);

      if (response.success || response.data) {
        message.success({
          content: `Cập nhật thành công: ${statusConfig[newStatus].text}`,
          icon: statusConfig[newStatus].icon,
        });
        refreshOrders();
      } else {
        message.error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      message.error(error.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.orders.delete(id));
      if (response.success) {
        message.success("Xóa đơn hàng thành công");
        refreshOrders();
      } else {
        message.error(response.message || "Xóa đơn hàng thất bại");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error(error.message || "Lỗi khi xóa đơn hàng");
    }
  };

  const handleAddPreOrderToCart = async (order) => {
    if (!order.orderDetails || order.orderDetails.length === 0) {
      message.warning("Đơn hàng này không có chi tiết sản phẩm");
      return;
    }

    try {
      message.loading({ content: "Đang thêm xe vào giỏ hàng...", key: "addCart" });
      
      const newItems = [];
      for (const detail of order.orderDetails) {
        if (detail.vehicleId && detail.vehicleVariantId) {
          const vehicleResponse = await axiosInstance.get(
            endpoints.vehicles.getById(detail.vehicleId)
          );
          
          if (vehicleResponse.success && vehicleResponse.data) {
            const vehicle = vehicleResponse.data;
            const variant = vehicle.vehicleVariant;
            
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
      }

      if (newItems.length > 0) {
        setCartItems((items) => {
          const existingIds = items.map(item => item.vehicleId);
          const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.vehicleId));
          if (uniqueNewItems.length === 0) {
            message.warning({ content: "Các xe này đã có trong giỏ hàng", key: "addCart" });
            return items;
          }
          message.success({ content: `Đã thêm ${uniqueNewItems.length} xe vào giỏ hàng B2B`, key: "addCart" });
          return [...items, ...uniqueNewItems];
        });
      } else {
        message.warning({ content: "Không có xe nào được thêm vào giỏ hàng", key: "addCart" });
      }
    } catch (error) {
      console.error("Error adding pre-order to cart:", error);
      message.error({ content: "Lỗi khi thêm xe vào giỏ hàng", key: "addCart" });
    }
  };

  const handleCreateContract = (order) => {
    navigate(`/dealer/contracts/create?orderId=${order.id}`);
  };

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedOrderId(null);
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
      width: 190,
      render: (status, record) => {
        const config = statusConfig[status] || statusConfig.CONFIRMED;

        return (
          <Select
            value={status}
            onChange={(newStatus) =>
              handleStatusChange(record.id, newStatus, record)
            }
            loading={updatingStatus[record.id]}
            disabled={updatingStatus[record.id]}
            style={{ width: "100%" }}
            size="middle"
            dropdownStyle={{
              padding: "4px",
            }}
            optionLabelProp="label"
          >
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <Option
                key={key}
                value={key}
                label={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "2px 0",
                    }}
                  >
                    <span
                      style={{
                        color: cfg.color,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {cfg.icon}
                    </span>
                    <span
                      style={{
                        color: cfg.color,
                        fontWeight: 500,
                        fontSize: "13px",
                      }}
                    >
                      {cfg.text}
                    </span>
                  </div>
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    backgroundColor: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      color: cfg.color,
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span
                    style={{
                      color: cfg.color,
                      fontWeight: 500,
                      fontSize: "13px",
                      flex: 1,
                    }}
                  >
                    {cfg.text}
                  </span>
                  {status === key && (
                    <CheckCircleOutlined
                      style={{
                        color: cfg.color,
                        fontSize: "14px",
                      }}
                    />
                  )}
                </div>
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_, record) => (
        <Space size={2} wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
              size="small"
              style={{ color: "#1890ff", padding: "4px 8px" }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/dealer/orders/${record.id}/edit`)}
              size="small"
              style={{ color: "#52c41a", padding: "4px 8px" }}
            />
          </Tooltip>

          {(record.orderType === 2 || record.orderType === "B2C_P") && (
            <Tooltip title="Thêm xe vào giỏ B2B">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAddPreOrderToCart(record)}
                style={{ padding: "4px 8px", fontSize: "12px" }}
              >
                Giỏ B2B
              </Button>
            </Tooltip>
          )}

          {(record.orderType === 0 || record.orderType === "B2C") && (
            <Tooltip title="Tạo hợp đồng">
              <Button
                type="default"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleCreateContract(record)}
                style={{ 
                  padding: "4px 8px", 
                  fontSize: "12px",
                  backgroundColor: "#fff",
                  borderColor: "#d9d9d9",
                  color: "#000"
                }}
              >
                Hợp đồng
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Xóa đơn hàng">
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa đơn hàng này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                style={{ padding: "4px 8px" }}
              />
            </Popconfirm>
          </Tooltip>
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
    <div className="dealer-manager-orders-page">
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              Quản lý đơn hàng
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
            scroll={{ x: 1600 }}
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

export default DealerManagerOrdersPage;
