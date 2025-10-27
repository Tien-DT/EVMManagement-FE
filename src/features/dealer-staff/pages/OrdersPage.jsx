// src/features/dealer-staff/pages/OrdersPage.jsx
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
  Popconfirm,
  Typography,
  Input,
  Row,
  Col,
  Segmented,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  RocketOutlined,
  StopOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const pageStyles = `
  .orders-page {
    min-height: 100%;
    padding: 32px 32px 48px;
    background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
  }

  .orders-hero-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(82, 196, 26, 0.1));
    border-radius: 18px;
    padding: 28px 32px;
    box-shadow: 0 20px 45px rgba(24, 144, 255, 0.12);
    margin-bottom: 28px;
  }

  @media (min-width: 768px) {
    .orders-hero-card {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .orders-hero-card__title {
    margin-bottom: 4px !important;
  }

  .orders-hero-card__subtitle {
    color: #4b5563;
    font-size: 14px;
  }

  .orders-hero-card__cta {
    border-radius: 999px;
    height: 46px;
    padding: 0 28px;
    font-weight: 600;
    box-shadow: 0 16px 28px rgba(24, 144, 255, 0.25);
  }

  .orders-metrics {
    margin-bottom: 28px;
  }

  .orders-metric-card {
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 16px !important;
    border: none !important;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    padding: 22px 24px !important;
    min-height: 124px;
    background: #ffffff !important;
  }

  .orders-metric-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .orders-metric-card__title {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
  }

  .orders-metric-card__value {
    margin: 6px 0 0;
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
  }

  .orders-metric-card__caption {
    margin: 6px 0 0;
    font-size: 12px;
    color: #9ca3af;
  }

  .orders-card {
    border-radius: 20px !important;
    border: none !important;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  }

  .orders-card__toolbar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }

  @media (min-width: 768px) {
    .orders-card__toolbar {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .orders-card__toolbar-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  .orders-card__count {
    font-size: 13px;
    color: #6b7280;
  }

  .orders-card__search {
    max-width: 280px;
    flex: 1 1 auto;
  }

  .orders-card__type-filter {
    min-width: 170px;
  }

  .orders-status-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .orders-status-option__icon {
    display: flex;
    align-items: center;
  }

  .table-row-light {
    background-color: #f9fbff;
  }

  .table-row-dark {
    background-color: #ffffff;
  }

  :global(.orders-card .ant-card-body) {
    padding: 24px !important;
  }

  :global(.orders-card .ant-table) {
    border-radius: 14px;
    overflow: hidden;
  }

  :global(.orders-card .ant-table-thead > tr > th) {
    background-color: #f1f5f9 !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
  }

  :global(.orders-card .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #eef2f7;
  }

  :global(.orders-card .ant-table-tbody > tr:hover > td) {
    background: #ecf3ff !important;
  }

  :global(.orders-card .ant-table-pagination) {
    margin-top: 24px !important;
  }

  :global(.orders-card__toolbar-right .ant-input-search .ant-input) {
    border-radius: 999px 0 0 999px;
  }

  :global(.orders-card__toolbar-right .ant-input-search .ant-input-search-button) {
    border-radius: 0 999px 999px 0;
  }

  :global(.orders-card__toolbar-right .ant-select-selector) {
    border-radius: 999px !important;
    background: #f8fafc !important;
  }

  :global(.orders-card .ant-select-dropdown) {
    border-radius: 12px;
  }

  :global(.orders-card .ant-select-item-option-active) {
    background-color: #f5f7ff !important;
  }

  .orders-state-card {
    border-radius: 18px !important;
    border: none !important;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  }
`;

const { Option } = Select;

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const statusTransitions = useMemo(
    () => ({
      CONFIRMED: ["CONFIRMED", "AWAITING_DEPOSIT", "CANCELED"],
      AWAITING_DEPOSIT: [
        "AWAITING_DEPOSIT",
        "IN_PROGRESS",
        "CANCELED",
      ],
      IN_PROGRESS: ["IN_PROGRESS", "READY_FOR_HANDOVER", "CANCELED"],
      READY_FOR_HANDOVER: [
        "READY_FOR_HANDOVER",
        "COMPLETED",
        "CANCELED",
      ],
      COMPLETED: ["COMPLETED"],
      CANCELED: ["CANCELED"],
    }),
    []
  );

  const orderFilters = useMemo(() => {
    const roleValue = user?.role;
    if (!roleValue) return {};

    const normalizedRole =
      typeof roleValue === "string" ? roleValue.toLowerCase() : "";
    const numericRole = Number(roleValue);

    const isDealerStaff =
      normalizedRole === "dealer_staff" ||
      normalizedRole === "dealer-staff" ||
      normalizedRole.includes("dealer_staff") ||
      normalizedRole.includes("dealer-staff") ||
      numericRole === 3;

    return isDealerStaff ? { orderType: 0 } : {};
  }, [user?.role]);

  // Cấu hình status với màu sắc và icon đẹp hơn
  const statusConfig = useMemo(
    () => ({
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
        text: "Chờ đặt cọc",
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
    }),
    []
  );

  const orderTypeDisplayConfig = useMemo(
    () => ({
      B2C: { color: "green", text: "B2C" },
      B2B: { color: "blue", text: "B2B" },
      PREORDER: { color: "orange", text: "Đặt trước" },
    }),
    []
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả" },
      ...Object.keys(statusConfig).map((key) => ({
        value: key,
        label: (
          <span className="orders-status-option">
            <span
              className="orders-status-option__icon"
              style={{ color: statusConfig[key].color }}
            >
              {React.cloneElement(statusConfig[key].icon, {
                style: { fontSize: 14 },
              })}
            </span>
            {statusConfig[key].text}
          </span>
        ),
      })),
    ],
    [statusConfig]
  );

  const orderTypeFilterOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả loại đơn" },
      { value: "B2C", label: "B2C" },
      { value: "B2B", label: "B2B" },
      { value: "PREORDER", label: "Đặt trước" },
    ],
    []
  );

  const getNormalizedStatus = (status) => (status || "CONFIRMED").toUpperCase();

  const getOrderTypeKey = (orderType) => {
    if (orderType === 2 || orderType === "B2C_P") {
      return "PREORDER";
    }
    if (orderType === 1 || orderType === "B2B") {
      return "B2B";
    }
    return "B2C";
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
          console.log("Found dealerId from profile:", userDealerId);

          if (userDealerId) {
            setDealerId(userDealerId);
          } else {
            console.error(
              "No dealerId in profile, response.data:",
              response.data
            );
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

  const {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    deleteOrder,
    changePage,
  } = useOrders(dealerId, orderFilters);

  useEffect(() => {
    console.log("OrdersPage - user:", user);
    console.log("OrdersPage - user.id (accountId):", user?.id);
    console.log("OrdersPage - dealerId:", dealerId);
    console.log("OrdersPage - orders:", orders);
    console.log("OrdersPage - isLoading:", isLoading);
    console.log("OrdersPage - error:", error);
  }, [user, dealerId, orders, isLoading, error]);

  const summaryCards = useMemo(() => {
    const formatNumber = (value) =>
      Number(value || 0).toLocaleString("vi-VN");

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.finalAmount || 0),
      0
    );

    const awaitingCount = orders.filter(
      (order) => getNormalizedStatus(order.status) === "AWAITING_DEPOSIT"
    ).length;
    const readyCount = orders.filter(
      (order) => getNormalizedStatus(order.status) === "READY_FOR_HANDOVER"
    ).length;
    const completedCount = orders.filter(
      (order) => getNormalizedStatus(order.status) === "COMPLETED"
    ).length;

    return [
      {
        key: "total",
        title: "Tổng đơn hàng",
        value: formatNumber(orders.length),
        caption: `${formatNumber(completedCount)} đơn đã hoàn tất`,
        icon: <ShoppingCartOutlined />,
        iconColor: "#1890ff",
        iconBg: "rgba(24, 144, 255, 0.15)",
      },
      {
        key: "revenue",
        title: "Giá trị đơn hàng",
        value: `${formatNumber(totalRevenue)} ₫`,
        caption: "Tổng thành tiền dự kiến",
        icon: <DollarCircleOutlined />,
        iconColor: "#52c41a",
        iconBg: "rgba(82, 196, 26, 0.15)",
      },
      {
        key: "priority",
        title: "Đơn cần chú ý",
        value: formatNumber(awaitingCount + readyCount),
        caption: `${formatNumber(awaitingCount)} chờ đặt cọc • ${formatNumber(
          readyCount
        )} sẵn sàng bàn giao`,
        icon: <FieldTimeOutlined />,
        iconColor: "#fa8c16",
        iconBg: "rgba(250, 140, 22, 0.15)",
      },
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const normalizedStatus = getNormalizedStatus(order.status);
      const matchesStatus =
        statusFilter === "ALL" || normalizedStatus === statusFilter;

      const normalizedType = getOrderTypeKey(order.orderType);
      const matchesType =
        orderTypeFilter === "ALL" || normalizedType === orderTypeFilter;

      if (!normalizedSearch) {
        return matchesStatus && matchesType;
      }

      const code = (order.code || "").toLowerCase();
      const customerName =
        (order.customer?.fullName || "").toLowerCase();

      const matchesSearch =
        code.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [orders, statusFilter, orderTypeFilter, searchTerm]);

  const { Title, Text } = Typography;
  const { Search } = Input;

  const handleStatusChange = async (orderId, newStatus, currentOrder) => {
    const currentStatus = (currentOrder.status || "CONFIRMED").toUpperCase();
    const allowedStatuses = statusTransitions[currentStatus] || [currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      message.warning("Trạng thái phải được cập nhật theo thứ tự");
      return;
    }

    if (newStatus === currentStatus) {
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
        const nextConfig = statusConfig[newStatus] || statusConfig.CONFIRMED;
        message.success({
          content: `Cập nhật thành công: ${nextConfig.text}`,
          icon: nextConfig.icon,
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
    const result = await deleteOrder(id);
    if (result.success) {
      message.success("Xóa đơn hàng thành công");
    } else {
      message.error(result.message || "Xóa đơn hàng thất bại");
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      width: 130,
      fixed: "left",
      render: (text) => (
        <span
          style={{
            fontWeight: 600,
            color: "#1890ff",
            fontSize: "13px",
          }}
        >
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
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      align: "right",
      render: (amount) => (
        <span style={{ fontWeight: 500 }}>
          {amount ? `${amount.toLocaleString()}` : "0"}
        </span>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      width: 110,
      align: "right",
      render: (amount) => (
        <span style={{ color: amount > 0 ? "#ff4d4f" : "#999" }}>
          {amount ? `-${amount.toLocaleString()}` : "0"}
        </span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      width: 130,
      align: "right",
      render: (amount) => (
        <span
          style={{
            fontWeight: 600,
            color: "#52c41a",
            fontSize: "14px",
          }}
        >
          {amount ? `${amount.toLocaleString()}` : "0"}
        </span>
      ),
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "orderType",
      width: 100,
      align: "center",
      render: (orderType) => {
        const key = getOrderTypeKey(orderType);
        const config = orderTypeDisplayConfig[key] || orderTypeDisplayConfig.B2C;

        return (
          <Tag color={config.color} style={{ fontWeight: 500 }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Đã cọc",
      key: "depositAmount",
      width: 110,
      align: "right",
      render: (_, record) => {
        console.log("Order record:", record); // DEBUG
        console.log("Order type:", record.orderType); // DEBUG
        console.log("Deposits:", record.deposits); // DEBUG
        
        if (record.orderType === 2 || record.orderType === "B2C_P") { // B2C_P - Pre-order
          // Calculate total deposit amount from deposits array
          const totalDeposit = record.deposits?.reduce((sum, deposit) => {
            return sum + (deposit.amount || 0);
          }, 0) || 0;
          
          console.log("Total deposit calculated:", totalDeposit); // DEBUG
          
          return (
            <span style={{ color: "#52c41a", fontWeight: 500 }}>
              {totalDeposit.toLocaleString()}
            </span>
          );
        }
        return <span style={{ color: "#999" }}>-</span>;
      },
    },
    {
      title: "Còn lại",
      key: "remainingAmount",
      width: 120,
      align: "right",
      render: (_, record) => {
        if (record.orderType === 2 || record.orderType === "B2C_P") { // B2C_P - Pre-order
          // Calculate total deposit amount from deposits array
          const totalDeposit = record.deposits?.reduce((sum, deposit) => {
            return sum + (deposit.amount || 0);
          }, 0) || 0;
          
          const remainingAmount = (record.finalAmount || 0) - totalDeposit;
          
          return (
            <span style={{ color: "#fa8c16", fontWeight: 500 }}>
              {remainingAmount.toLocaleString()}
            </span>
          );
        }
        return <span style={{ color: "#999" }}>-</span>;
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
        const normalizedStatus = getNormalizedStatus(status);
        const config = statusConfig[normalizedStatus] || statusConfig.CONFIRMED;
        const allowedStatuses =
          statusTransitions[normalizedStatus] || [normalizedStatus];
        const isSelectionDisabled =
          updatingStatus[record.id] || allowedStatuses.length <= 1;

        return (
          <Select
            value={normalizedStatus}
            onChange={(nextStatus) =>
              handleStatusChange(record.id, nextStatus, record)
            }
            loading={updatingStatus[record.id]}
            disabled={isSelectionDisabled}
            style={{ width: "100%" }}
            size="middle"
            dropdownStyle={{
              padding: "4px",
            }}
            optionLabelProp="label"
          >
            {allowedStatuses.map((key) => {
              const cfg = statusConfig[key] || statusConfig.CONFIRMED;
              return (
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
                        {React.cloneElement(cfg.icon, {
                          style: { fontSize: 14 },
                        })}
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
                      {React.cloneElement(cfg.icon, {
                        style: { fontSize: 16 },
                      })}
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
                    {normalizedStatus === key && (
                      <CheckCircleOutlined
                        style={{
                          color: cfg.color,
                          fontSize: "14px",
                        }}
                      />
                    )}
                  </div>
                </Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size={2}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/${record.id}`)}
            size="small"
            style={{
              color: "#1890ff",
              padding: "4px 8px",
            }}
          >
            Xem
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/edit/${record.id}`)}
            size="small"
            style={{
              color: "#52c41a",
              padding: "4px 8px",
            }}
          >
            Sửa
          </Button>
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
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderFallbackCard = (content) => (
    <div className="orders-page">
      <Card className="orders-state-card" bordered={false}>
        <div style={{ textAlign: "center", padding: "50px" }}>{content}</div>
      </Card>
      <style jsx>{pageStyles}</style>
    </div>
  );

  if (loadingProfile) {
    return renderFallbackCard(
      <>
        <Spin size="large" />
        <p style={{ marginTop: "16px", color: "#666" }}>
          Đang tải thông tin dealer...
        </p>
      </>
    );
  }

  if (!dealerId) {
    return renderFallbackCard(
      <>
        <p style={{ color: "#ff4d4f", fontSize: "16px", fontWeight: 600 }}>
          Không tìm thấy thông tin dealer
        </p>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
          Account ID: {user?.id}
        </p>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: "16px" }}
        >
          Tải lại trang
        </Button>
      </>
    );
  }

  if (error) {
    return renderFallbackCard(
      <>
        <p style={{ color: "#ff4d4f", fontSize: "16px", fontWeight: 600 }}>
          Lỗi: {error}
        </p>
        <Button
          type="primary"
          onClick={refreshOrders}
          style={{ marginTop: "16px" }}
        >
          Thử lại
        </Button>
      </>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-hero-card">
        <div>
          <Title level={3} className="orders-hero-card__title">
            Quản lý đơn hàng
          </Title>
          <Text className="orders-hero-card__subtitle">
            Theo dõi tiến độ và nâng cao trải nghiệm bàn giao cho khách hàng.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="orders-hero-card__cta"
          onClick={() => navigate("/dealer-staff/orders/create")}
        >
          Tạo đơn hàng mới
        </Button>
      </div>

      <Row gutter={[16, 16]} className="orders-metrics">
        {summaryCards.map((card) => (
          <Col xs={24} sm={12} xl={8} key={card.key}>
            <Card className="orders-metric-card" bordered={false} hoverable>
              <div
                className="orders-metric-card__icon"
                style={{
                  backgroundColor: card.iconBg,
                  color: card.iconColor,
                }}
              >
                {React.cloneElement(card.icon, { style: { fontSize: 22 } })}
              </div>
              <div>
                <p className="orders-metric-card__title">{card.title}</p>
                <p className="orders-metric-card__value">{card.value}</p>
                <p className="orders-metric-card__caption">{card.caption}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="orders-card" bordered={false}>
        <div className="orders-card__toolbar">
          <Segmented
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusFilterOptions}
            size="large"
          />

          <div className="orders-card__toolbar-right">
            <Text type="secondary" className="orders-card__count">
              Hiển thị {filteredOrders.length} / {orders.length} đơn trong trang
            </Text>
            <Select
              value={orderTypeFilter}
              onChange={setOrderTypeFilter}
              className="orders-card__type-filter"
              size="middle"
            >
              {orderTypeFilterOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Search
              allowClear
              placeholder="Tìm kiếm theo mã hoặc khách hàng"
              className="orders-card__search"
              onChange={(event) => setSearchTerm(event.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              enterButton
            />
          </div>
        </div>

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
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ fontSize: "16px", color: "#999" }}>
                  Không có dữ liệu đơn hàng
                </p>
              </div>
            ),
          }}
          size="middle"
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx>{pageStyles}</style>
    </div>
  );
};

export default OrdersPage;
