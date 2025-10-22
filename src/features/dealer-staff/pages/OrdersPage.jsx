// src/features/dealer-staff/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Card, Space, message, Tag, Spin } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ✅ Bước 1: Lấy dealerId từ UserProfile
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.log("No user.id found");
        setLoadingProfile(false);
        return;
      }

      try {
        console.log("Fetching user profile for user.id:", user.id);

        // Gọi API lấy UserProfile
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        console.log("User profile response:", response);

        if (response.success && response.data) {
          // Kiểm tra dealerId trong response
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

  // ✅ Bước 2: Gọi useOrders với dealerId đã lấy được
  const {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
    deleteOrder,
    changePage,
  } = useOrders(dealerId);

  // Log để debug
  useEffect(() => {
    console.log("OrdersPage - user:", user);
    console.log("OrdersPage - user.id (accountId):", user?.id);
    console.log("OrdersPage - dealerId:", dealerId);
    console.log("OrdersPage - orders:", orders);
    console.log("OrdersPage - isLoading:", isLoading);
    console.log("OrdersPage - error:", error);
  }, [user, dealerId, orders, isLoading, error]);

  // Xử lý xóa đơn hàng
  const handleDelete = async (id) => {
    const result = await deleteOrder(id);
    if (result.success) {
      message.success("Xóa đơn hàng thành công");
    } else {
      message.error(result.message || "Xóa đơn hàng thất bại");
    }
  };

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "N/A",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (amount ? `${amount.toLocaleString()} VNĐ` : "0 VNĐ"),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (amount) => (amount ? `${amount.toLocaleString()} VNĐ` : "0 VNĐ"),
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount) => (amount ? `${amount.toLocaleString()} VNĐ` : "0 VNĐ"),
    },
    {
      title: "Ngày giao dự kiến",
      dataIndex: "expectedDeliveryAt",
      key: "expectedDeliveryAt",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          CONFIRMED: { color: "blue", text: "Đã xác nhận" },
          AWAITING_DEPOSIT: { color: "orange", text: "Chờ đặt cọc" },
          IN_PROGRESS: { color: "processing", text: "Đang xử lý" },
          READY_FOR_HANDOVER: { color: "cyan", text: "Sẵn sàng bàn giao" },
          COMPLETED: { color: "success", text: "Hoàn thành" },
          CANCELED: { color: "error", text: "Đã hủy" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dealer-staff/orders/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Hiển thị loading khi đang lấy dealerId
  if (loadingProfile) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Đang tải thông tin dealer...</p>
        </div>
      </Card>
    );
  }

  // Hiển thị error nếu không có dealerId
  if (!dealerId) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "red" }}>Không tìm thấy thông tin dealer</p>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            Account ID: {user?.id}
          </p>
          <Button
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px" }}
          >
            Tải lại trang
          </Button>
        </div>
      </Card>
    );
  }

  // Hiển thị error từ API
  if (error) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "red" }}>Lỗi: {error}</p>
          <Button onClick={refreshOrders}>Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="orders-page">
      <Card
        title="Quản lý đơn hàng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/dealer-staff/orders/create")}
            style={{ 
              backgroundColor: "#1890ff", 
              borderColor: "#1890ff",
              color: "white",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              padding: "0 16px",
              height: "40px",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            className="ant-btn-primary"
          >
            Tạo đơn hàng mới
          </Button>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.totalItems,
              showSizeChanger: false,
              onChange: changePage,
            }}
            locale={{
              emptyText: "Không có dữ liệu đơn hàng",
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default OrdersPage;
