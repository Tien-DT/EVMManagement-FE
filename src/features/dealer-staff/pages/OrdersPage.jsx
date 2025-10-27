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
  RocketOutlined,
  StopOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
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
    background: linear-gradient(135deg, #f6f9ff 0%, #ffffff 100%);
  }

  .orders-hero-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: 20px;
    padding: 28px 32px;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.18), rgba(82, 196, 26, 0.12));
    box-shadow: 0 18px 48px rgba(24, 144, 255, 0.18);
    margin-bottom: 32px;
  }

  @media (min-width: 768px) {
    .orders-hero-card {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .orders-hero-card__title {
    margin-bottom: 6px !important;
  }

  .orders-hero-card__subtitle {
    color: #4b5563;
    font-size: 14px;
    max-width: 520px;
  }

  .orders-hero-card__cta {
    border-radius: 999px;
    height: 48px;
    padding: 0 30px;
    font-weight: 600;
    box-shadow: 0 20px 32px rgba(24, 144, 255, 0.26);
  }

  .orders-metrics {
    margin-bottom: 28px;
  }

  .orders-metric-card {
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 18px !important;
    border: none !important;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    padding: 22px 24px !important;
    min-height: 120px;
    background: #ffffff !important;
  }

  .orders-metric-card__icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .orders-metric-card__title {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .orders-metric-card__value {
    margin: 8px 0 0;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
  }

  .orders-metric-card__caption {
    margin: 6px 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .orders-card {
    border-radius: 22px !important;
    border: none !important;
    box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
  }

  .orders-card__toolbar {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 20px;
  }

  @media (min-width: 992px) {
    .orders-card__toolbar {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .orders-card__filters {
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
    min-width: 160px;
  }

  .orders-status-segment {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
  }

  .orders-status-segment__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .orders-status-segment__count {
    background: rgba(15, 23, 42, 0.08);
    color: #0f172a;
    border-radius: 999px;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 600;
    line-height: 20px;
    min-width: 24px;
    text-align: center;
  }

  .orders-table__order-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .orders-table__order-code {
    font-weight: 700;
    font-size: 14px;
    color: #1d4ed8;
  }

  .orders-table__order-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .orders-table__customer {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .orders-table__customer-name {
    font-weight: 600;
    color: #0f172a;
  }

  .orders-table__customer-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #475569;
  }

  .orders-table__amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .orders-table__amount-final {
    font-weight: 700;
    font-size: 15px;
    color: #16a34a;
  }

  .orders-table__amount-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: #64748b;
  }

  .orders-table__amount-discount {
    color: #dc2626;
  }

  .orders-table__delivery {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #475569;
  }

  .orders-table__delivery-date {
    font-weight: 600;
    font-size: 13px;
    color: #1f2937;
  }

  .orders-status-control {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .orders-status-control__tag {
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    font-weight: 600;
    padding: 4px 12px;
    border: none;
  }

  .orders-status-control__icon {
    display: flex;
    align-items: center;
  }

  .orders-status-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .orders-status-option--dropdown {
    padding: 6px 8px;
    border-radius: 10px;
    background: rgba(241, 245, 249, 0.6);
    transition: background 0.2s ease;
  }

  .orders-status-option--dropdown:hover {
    background: rgba(191, 219, 254, 0.5);
  }

  :global(.orders-card .ant-card-body) {
    padding: 26px !important;
  }

  :global(.orders-card .ant-segmented) {
    background: #f3f4f6;
    border-radius: 16px;
    padding: 6px;
  }

  :global(.orders-card .ant-segmented-item-selected) {
    background: #ffffff !important;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  }

  :global(.orders-card .ant-segmented-item-label) {
    padding: 0 !important;
  }

  :global(.orders-card .ant-input-search .ant-input) {
    border-radius: 999px 0 0 999px;
  }

  :global(.orders-card .ant-input-search .ant-input-search-button) {
    border-radius: 0 999px 999px 0;
  }

  :global(.orders-card .ant-select-selector) {
    border-radius: 12px !important;
    padding: 6px 12px !important;
    background: #f8fafc !important;
  }

  :global(.orders-card .ant-select-selection-item) {
    font-weight: 600;
    color: #1f2937 !important;
  }

  :global(.orders-card .ant-select-dropdown) {
    border-radius: 14px;
    padding: 6px;
  }

  :global(.orders-card .ant-table) {
    border-radius: 18px;
    overflow: hidden;
    background: #ffffff;
  }

  :global(.orders-card .ant-table-thead > tr > th) {
    background-color: #f1f5f9 !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
    border-bottom: none !important;
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

  .table-row-light {
    background-color: #f9fbff;
  }

  .table-row-dark {
    background-color: #ffffff;
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

  const statusSequence = useMemo(
    () => [
      "CONFIRMED",
      "QUOTATION_RECEIVED",  // For B2B orders only
      "AWAITING_DEPOSIT",
      "IN_PROGRESS",
      "READY_FOR_HANDOVER",
      "COMPLETED",
    ],
    []
  );

  const statusFlow = useMemo(() => {
    const cancellableStatuses = new Set([
      "CONFIRMED",
      "AWAITING_DEPOSIT",
      "IN_PROGRESS",
    ]);
    const map = {};

    // Filter out QUOTATION_RECEIVED for B2C orders (this page is for B2C only)
    const b2cStatusSequence = statusSequence.filter(s => s !== "QUOTATION_RECEIVED");

    b2cStatusSequence.forEach((status, index) => {
      const options = new Set([status]);
      const next = b2cStatusSequence[index + 1];
      if (next) {
        options.add(next);
      }
      if (cancellableStatuses.has(status)) {
        options.add("CANCELED");
      }
      map[status] = Array.from(options);
    });

    map.CANCELED = ["CANCELED"];

    return map;
  }, [statusSequence]);

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
      QUOTATION_RECEIVED: {
        color: "#722ed1",
        bgColor: "#f9f0ff",
        borderColor: "#d3adf7",
        text: "Đã nhận báo giá",
        icon: <FileTextOutlined />,
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
        text: "Đã ký",
        icon: <CheckCircleOutlined />,
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

  const formatCurrency = (value) =>
    `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

  const formatDate = (value, fallback = "Chưa cập nhật") =>
    value ? moment(value).format("DD/MM/YYYY") : fallback;

  const formatDateTime = (value, fallback = "Chưa tạo") =>
    value ? moment(value).format("HH:mm DD/MM") : fallback;


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

  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length };

    statusSequence.forEach((status) => {
      counts[status] = 0;
    });
    counts.CANCELED = 0;

    orders.forEach((order) => {
      const normalizedStatus = getNormalizedStatus(order.status);
      if (counts[normalizedStatus] === undefined) {
        counts[normalizedStatus] = 0;
      }
      counts[normalizedStatus] += 1;
    });

    return counts;
  }, [orders, statusSequence]);

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

  const statusFilterOptions = useMemo(() => {
    const baseOptions = [
      {
        value: "ALL",
        label: (
          <div className="orders-status-segment">
            <span>Tất cả</span>
            <span className="orders-status-segment__count">
              {statusCounts.ALL || 0}
            </span>
          </div>
        ),
      },
    ];

    statusSequence.forEach((key) => {
      const config = statusConfig[key];
      baseOptions.push({
        value: key,
        label: (
          <div className="orders-status-segment">
            <span
              className="orders-status-segment__icon"
              style={{ color: config.color }}
            >
              {React.cloneElement(config.icon, { style: { fontSize: 14 } })}
            </span>
            <span>{config.text}</span>
            <span className="orders-status-segment__count">
              {statusCounts[key] || 0}
            </span>
          </div>
        ),
      });
    });

    const canceledConfig = statusConfig.CANCELED;

    baseOptions.push({
      value: "CANCELED",
      label: (
        <div className="orders-status-segment">
          <span
            className="orders-status-segment__icon"
            style={{ color: canceledConfig.color }}
          >
            {React.cloneElement(canceledConfig.icon, {
              style: { fontSize: 14 },
            })}
          </span>
          <span>{canceledConfig.text}</span>
          <span className="orders-status-segment__count">
            {statusCounts.CANCELED || 0}
          </span>
        </div>
      ),
    });

    return baseOptions;
  }, [statusCounts, statusConfig, statusSequence]);

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
    const allowedStatuses = statusFlow[currentStatus] || [currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      message.warning("Không thể quay về trạng thái trước đó");
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
      title: "Đơn hàng",
      key: "order",
      width: 220,
      fixed: "left",
      render: (_, record) => {
        const code = record.code || "N/A";
        const typeKey = getOrderTypeKey(record.orderType);
        const typeConfig =
          orderTypeDisplayConfig[typeKey] || orderTypeDisplayConfig.B2C;
        const created = record.createdDate || record.createdAt;

        return (
          <div className="orders-table__order-cell">
            <span className="orders-table__order-code">{code}</span>
            <div className="orders-table__order-meta">
              <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
              <span>{formatDateTime(created)}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 220,
      render: (_, record) => {
        const name = record.customer?.fullName || "Không rõ";
        const phone =
          record.customer?.phoneNumber ||
          record.customer?.phone ||
          record.customer?.contactNumber ||
          record.customer?.mobile;
        const email = record.customer?.email;

        return (
          <div className="orders-table__customer">
            <span className="orders-table__customer-name">{name}</span>
            <div className="orders-table__customer-meta">
              {phone && <span>{phone}</span>}
              {email && <span>{email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá trị",
      key: "amount",
      dataIndex: "finalAmount",
      align: "right",
      width: 170,
      render: (_, record) => {
        const totalAmount = formatCurrency(record.totalAmount);
        const finalAmount = formatCurrency(record.finalAmount);
        const discount = Number(record.discountAmount || 0);

        return (
          <div className="orders-table__amount">
            <span className="orders-table__amount-final">{finalAmount}</span>
            <div className="orders-table__amount-meta">
              <span>Tạm tính: {totalAmount}</span>
              {discount > 0 && (
                <span className="orders-table__amount-discount">
                  Giảm: -{formatCurrency(discount)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Bàn giao dự kiến",
      dataIndex: "expectedDeliveryAt",
      key: "expectedDeliveryAt",
      width: 160,
      align: "center",
      render: (date) => (
        <div className="orders-table__delivery">
          <span className="orders-table__delivery-date">
            {formatDate(date, "Chưa hẹn")}
          </span>
        </div>
      ),
    },
    {
      title: "Tiến trình",
      dataIndex: "status",
      key: "status",
      width: 230,
      render: (status, record) => {
        const normalizedStatus = getNormalizedStatus(status);
        const config = statusConfig[normalizedStatus] || statusConfig.CONFIRMED;
        const allowedStatuses =
          statusFlow[normalizedStatus] || [normalizedStatus];
        const isSelectionDisabled =
          updatingStatus[record.id] || allowedStatuses.length <= 1;

        return (
          <div className="orders-status-control">
            <Tag
              className="orders-status-control__tag"
              color={config.bgColor}
              style={{
                color: config.color,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              <span className="orders-status-control__icon">
                {React.cloneElement(config.icon, { style: { fontSize: 14 } })}
              </span>
              {config.text}
            </Tag>
            <Select
              value={normalizedStatus}
              onChange={(nextStatus) =>
                handleStatusChange(record.id, nextStatus, record)
              }
              loading={updatingStatus[record.id]}
              disabled={isSelectionDisabled}
              size="middle"
              dropdownMatchSelectWidth={false}
              className="orders-status-control__select"
              optionLabelProp="label"
              style={{ width: "100%" }}
            >
              {allowedStatuses.map((key) => {
                const cfg = statusConfig[key] || statusConfig.CONFIRMED;
                return (
                  <Option
                    key={key}
                    value={key}
                    label={
                      <div className="orders-status-option">
                        <span style={{ color: cfg.color }}>
                          {React.cloneElement(cfg.icon, {
                            style: { fontSize: 14 },
                          })}
                        </span>
                        <span>{cfg.text}</span>
                      </div>
                    }
                  >
                    <div
                      className="orders-status-option orders-status-option--dropdown"
                      style={{ color: cfg.color }}
                    >
                      <span>
                        {React.cloneElement(cfg.icon, {
                          style: { fontSize: 16 },
                        })}
                      </span>
                      <span>{cfg.text}</span>
                      {normalizedStatus === key && (
                        <CheckCircleOutlined style={{ marginLeft: "auto" }} />
                      )}
                    </div>
                  </Option>
                );
              })}
            </Select>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 170,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" style={{ justifyContent: "flex-end" }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/${record.id}`)}
            size="small"
            title="Xem chi tiết"
            style={{ color: "#1890ff", padding: "4px 8px" }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/edit/${record.id}`)}
            size="small"
            title="Chỉnh sửa"
            style={{ color: "#52c41a", padding: "4px 8px" }}
          />
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
              title="Xóa"
              style={{ padding: "4px 8px" }}
            />
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

          <div className="orders-card__filters">
            <Text type="secondary" className="orders-card__count">
              {statusFilter === "ALL"
                ? `Hiển thị ${filteredOrders.length}/${orders.length} đơn`
                : `Có ${filteredOrders.length} đơn ${
                    statusConfig[statusFilter]?.text?.toLowerCase() || ""
                  }`}
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
              placeholder="Tìm theo mã hoặc khách hàng"
              className="orders-card__search"
              onChange={(event) => setSearchTerm(event.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              enterButton
              size="middle"
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
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
