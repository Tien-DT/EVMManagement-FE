// src/features/dealer-manager/pages/DealerManagerOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  Tabs,
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
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useDealerManagerOrders } from "../hooks/useDealerManagerOrders";
import OrderCartB2B from "../components/OrderCartB2B";
import OrderDetailModal from "../components/OrderDetailModal";
import AcceptQuotationModal from "../components/AcceptQuotationModal";
import DepositModal from "../components/DepositModal";
import FinalPaymentModal from "../components/FinalPaymentModal";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const STATUS_ORDER = {
  AWAITING_CONFIRM: 0,
  CONFIRMED: 1,
  QUOTATION_RECEIVED: 2,
  QUOTATION_ACCEPTED: 3,
  CREATED_CONTRACT: 4,
  DEALER_SIGNED_CONTRACT: 5,
  SIGNED_CONTRACT: 6,
  AWAITING_DEPOSIT: 7,
  DEPOSIT_SUCCESS: 8,
  IN_PROGRESS: 9,
  IN_TRANSIT: 10,
  READY_FOR_HANDOVER: 11,
  COMPLETED: 12,
  CANCELED: 13,
};

const isTerminalOrderStatus = (status) =>
  status === "COMPLETED" || status === "CANCELED";

const canTransitionOrderStatus = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) {
    return false;
  }

  if (currentStatus === targetStatus) {
    return true;
  }

  if (isTerminalOrderStatus(currentStatus)) {
    return false;
  }

  if (targetStatus === "CANCELED") {
    return true;
  }

  const currentRank = STATUS_ORDER[currentStatus];
  const targetRank = STATUS_ORDER[targetStatus];

  if (typeof currentRank !== "number" || typeof targetRank !== "number") {
    return false;
  }

  return targetRank >= currentRank;
};

const DealerManagerOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("B2B");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [quotationModalVisible, setQuotationModalVisible] = useState(false);
  const [selectedOrderForQuotation, setSelectedOrderForQuotation] = useState(null);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedOrderForDeposit, setSelectedOrderForDeposit] = useState(null);
  const [finalPaymentModalVisible, setFinalPaymentModalVisible] = useState(false);
  const [selectedOrderForFinalPayment, setSelectedOrderForFinalPayment] = useState(null);

  const statusConfig = {
    AWAITING_CONFIRM: {
      color: "#faad14",
      bgColor: "#fffbe6",
      borderColor: "#ffe58f",
      text: "Chờ EVM xác nhận",
      icon: <ClockCircleOutlined />,
    },
    CONFIRMED: {
      color: "#1890ff",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
      text: "Đã xác nhận",
      icon: <CheckCircleOutlined />,
    },
    QUOTATION_RECEIVED: {
      color: "#722ed1",
      bgColor: "#f9f0ff",
      borderColor: "#d3adf7",
      text: "Đã nhận báo giá",
      icon: <FileTextOutlined />,
    },
    QUOTATION_ACCEPTED: {
      color: "#1890ff",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
      text: "Đã chấp nhận báo giá",
      icon: <CheckCircleOutlined />,
    },
    CREATED_CONTRACT: {
      color: "#531dab",
      bgColor: "#f9f0ff",
      borderColor: "#d3adf7",
      text: "Chờ EVM ký hợp đồng",
      icon: <FileTextOutlined />,
    },
    DEALER_SIGNED_CONTRACT: {
      color: "#13c2c2",
      bgColor: "#e6fffb",
      borderColor: "#87e8de",
      text: "Dealer đã ký HĐ",
      icon: <FileTextOutlined />,
    },
    SIGNED_CONTRACT: {
      color: "#13c2c2",
      bgColor: "#e6fffb",
      borderColor: "#87e8de",
      text: "Hợp đồng đã ký",
      icon: <CheckCircleOutlined />,
    },
    AWAITING_DEPOSIT: {
      color: "#fa8c16",
      bgColor: "#fff7e6",
      borderColor: "#ffd591",
      text: "Chờ đặt cọc",
      icon: <DollarCircleOutlined />,
    },
    DEPOSIT_SUCCESS: {
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
      text: "Đã đặt cọc",
      icon: <CheckCircleOutlined />,
    },
    IN_PROGRESS: {
      color: "#1890ff",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
      text: "Đang chuẩn bị xe",
      icon: <SyncOutlined spin />,
    },
    IN_TRANSIT: {
      color: "#13c2c2",
      bgColor: "#e6fffb",
      borderColor: "#87e8de",
      text: "Đang vận chuyển",
      icon: <RocketOutlined />,
    },
    READY_FOR_HANDOVER: {
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
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

  const {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    changePage,
  } = useDealerManagerOrders(dealerId);

  const handleStatusChange = async (orderId, newStatus, currentOrder) => {
    if (!currentOrder) {
      return;
    }

    if (newStatus === currentOrder.status) {
      return;
    }

    if (!canTransitionOrderStatus(currentOrder.status, newStatus)) {
      message.warning("Khong the chuyen ve trang thai truoc do.");
      return;
    }

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

      const response = await axiosInstance.put(
        endpoints.orders.update(orderId),
        updateData
      );


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
        console.error("❌ Error fetching order details:", err);
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
            console.error("❌ Error fetching variant:", err);
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

  const handleAcceptQuotation = (order) => {
    setSelectedOrderForQuotation(order);
    setQuotationModalVisible(true);
  };

  const handleCloseQuotationModal = () => {
    setQuotationModalVisible(false);
    setSelectedOrderForQuotation(null);
  };

  const handleCreateDeposit = (order) => {
    setSelectedOrderForDeposit(order);
    setDepositModalVisible(true);
  };

  const handleCloseDepositModal = () => {
    setDepositModalVisible(false);
    setSelectedOrderForDeposit(null);
  };

  const handleFinalPayment = (order) => {
    setSelectedOrderForFinalPayment(order);
    setFinalPaymentModalVisible(true);
  };

  const handleCloseFinalPaymentModal = () => {
    setFinalPaymentModalVisible(false);
    setSelectedOrderForFinalPayment(null);
  };

  const handleQuotationAccepted = () => {
    refreshOrders();
  };

  const b2bOrders = useMemo(
    () =>
      (orders || []).filter(
        (order) => order.orderType === 1 || order.orderType === "B2B"
      ),
    [orders]
  );

  const customerOrders = useMemo(
    () =>
      (orders || []).filter(
        (order) =>
          order.orderType === 0 ||
          order.orderType === "B2C" ||
          order.orderType === 2 ||
          order.orderType === "B2C_P"
      ),
    [orders]
  );

  const displayedOrders = activeTab === "B2B" ? b2bOrders : customerOrders;

  const tabItems = useMemo(
    () => [
      {
        key: "B2B",
        label: `Đơn hàng hãng (${b2bOrders.length})`,
        children: null,
      },
      {
        key: "CUSTOMER",
        label: `Đơn hàng khách (${customerOrders.length})`,
        children: null,
      },
    ],
    [b2bOrders.length, customerOrders.length]
  );

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
      title: "Đặt cọc",
      key: "depositAmount",
      width: 140,
      align: "right",
      render: (_, record) => {
        // Deposit amount is 10% of total amount
        const depositAmount = record.totalAmount ? record.totalAmount * 0.1 : 0;

        return (
          <span style={{ fontWeight: 600, color: "#fa8c16", fontSize: "14px" }}>
            {depositAmount > 0 ? `${depositAmount.toLocaleString()}` : "0"}
          </span>
        );
      },
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
        const selectDisabled =
          isTerminalOrderStatus(record.status) || updatingStatus[record.id];

        // Check if order is B2B
        const isB2B = record.orderType === 1 || record.orderType === "B2B";

        // Lọc chỉ hiển thị các trạng thái có thể chuyển đến
        const availableStatuses = Object.entries(statusConfig).filter(([key]) => {
          // QUOTATION_RECEIVED chỉ hiển thị cho B2B orders
          if (key === "QUOTATION_RECEIVED" && !isB2B) {
            return false;
          }
          return canTransitionOrderStatus(record.status, key);
        });

        return (
          <Select
            value={status}
            onChange={(newStatus) =>
              handleStatusChange(record.id, newStatus, record)
            }
            loading={updatingStatus[record.id]}
            disabled={selectDisabled}
            style={{ width: "100%" }}
            size="middle"
            dropdownStyle={{
              padding: "4px",
            }}
            optionLabelProp="label"
          >
            {availableStatuses.map(([key, cfg]) => (
              <Select.Option
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
              </Select.Option>
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

          {/* B2B Orders with Quotation - Accept Quotation Button */}
          {(record.orderType === 1 || record.orderType === "B2B") &&
           record.quotationId &&
           record.status === "QUOTATION_RECEIVED" && (
            <Tooltip title="Chấp nhận báo giá từ EVM Staff">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAcceptQuotation(record)}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a"
                }}
              >
                Chấp nhận báo giá
              </Button>
            </Tooltip>
          )}

          {/* Deposit Button - Show for AWAITING_DEPOSIT status and no PAID deposits */}
          {record.status === "AWAITING_DEPOSIT" && (() => {
            // Check if there are any PAID deposits
            const hasPaidDeposit = record.deposits && Array.isArray(record.deposits)
              ? record.deposits.some(d => d.status === "PAID" || d.status === 1)
              : false;

            // Only show button if no PAID deposit exists
            return !hasPaidDeposit && (
              <Tooltip title="Đặt cọc 10%">
                <Button
                  type="primary"
                  size="small"
                  icon={<DollarCircleOutlined />}
                  onClick={() => handleCreateDeposit(record)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    backgroundColor: "#fa8c16",
                    borderColor: "#fa8c16"
                  }}
                >
                  Đặt cọc
                </Button>
              </Tooltip>
            );
          })()}

          {/* Final Payment Button - Show for READY_FOR_HANDOVER status */}
          {(record.status === "READY_FOR_HANDOVER" || record.status?.toUpperCase() === "READY_FOR_HANDOVER") && (
            <Tooltip title="Trả phần tiền còn lại (90%)">
              <Button
                type="primary"
                size="small"
                icon={<DollarCircleOutlined />}
                onClick={() => handleFinalPayment(record)}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a"
                }}
              >
                Trả tiền còn lại
              </Button>
            </Tooltip>
          )}

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
          <>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={displayedOrders}
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
          </>
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

      <AcceptQuotationModal
        visible={quotationModalVisible}
        order={selectedOrderForQuotation}
        onClose={handleCloseQuotationModal}
        onSuccess={handleQuotationAccepted}
      />

      <DepositModal
        visible={depositModalVisible}
        order={selectedOrderForDeposit}
        onClose={handleCloseDepositModal}
        onSuccess={refreshOrders}
      />

      <FinalPaymentModal
        visible={finalPaymentModalVisible}
        order={selectedOrderForFinalPayment}
        onClose={handleCloseFinalPaymentModal}
        onSuccess={refreshOrders}
      />
    </div>
  );
};

export default DealerManagerOrdersPage;
