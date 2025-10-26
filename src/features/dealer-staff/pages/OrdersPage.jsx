// src/features/dealer-staff/pages/OrdersPage.jsx
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
  Popconfirm,
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
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Option } = Select;

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Cấu hình status với màu sắc và icon đẹp hơn
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
  } = useOrders(dealerId);

  useEffect(() => {
    console.log("OrdersPage - user:", user);
    console.log("OrdersPage - user.id (accountId):", user?.id);
    console.log("OrdersPage - dealerId:", dealerId);
    console.log("OrdersPage - orders:", orders);
    console.log("OrdersPage - isLoading:", isLoading);
    console.log("OrdersPage - error:", error);
  }, [user, dealerId, orders, isLoading, error]);

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
        if (orderType === 2 || orderType === "B2C_P") { // B2C_P
          return (
            <Tag color="orange" style={{ fontWeight: 500 }}>
              Đặt trước
            </Tag>
          );
        } else if (orderType === 1 || orderType === "B2B") { // B2B
          return (
            <Tag color="blue" style={{ fontWeight: 500 }}>
              B2B
            </Tag>
          );
        } else { // B2C
          return (
            <Tag color="green" style={{ fontWeight: 500 }}>
              B2C
            </Tag>
          );
        }
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
    <div className="orders-page">
      <Card
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Quản lý đơn hàng
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/dealer-staff/orders/create")}
            size="large"
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            Tạo đơn hàng mới
          </Button>
        }
        styles={{
          body: { padding: "16px" },
        }}
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
            dataSource={orders}
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
                  Tổng <span style={{ color: "#1890ff" }}>{total}</span> đơn
                  hàng
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
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />
        )}
      </Card>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-select-dropdown .ant-select-item-option:hover {
          background-color: #f5f5f5 !important;
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
          color: #262626 !important;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
