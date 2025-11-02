// src/features/dealer-staff/pages/TestDriveBookingsPage.jsx
import React, { useState, useMemo, useEffect } from "react";
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
  Input,
  Row,
  Col,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { useTestDriveBookings } from "../hooks/useTestDriveBookings";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const TestDriveBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch dealerId from userProfile API
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.log("No user.id found");
        setLoadingProfile(false);
        return;
      }

      // Check cached userProfile first
      const storedUserProfileStr = localStorage.getItem("userProfile");
      if (storedUserProfileStr) {
        try {
          const storedUserProfile = JSON.parse(storedUserProfileStr);
          if (storedUserProfile.dealerId) {
            console.log("Using cached dealerId:", storedUserProfile.dealerId);
            setDealerId(storedUserProfile.dealerId);
            setLoadingProfile(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing cached userProfile:", error);
        }
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
            // Cache the profile
            localStorage.setItem("userProfile", JSON.stringify(response.data));
          } else {
            console.error("No dealerId in profile, response.data:", response.data);
          }
        } else {
          console.error("Profile API unsuccessful:", response);
        }
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

  const filters = useMemo(() => {
    const filterObj = {};
    if (statusFilter !== "ALL") {
      filterObj.status = statusFilter;
    }
    return filterObj;
  }, [statusFilter]);

  const {
    bookings,
    isLoading,
    error,
    pagination,
    refreshBookings,
    changePage,
  } = useTestDriveBookings(dealerId, filters);

  const statusOptions = [
    { value: "ALL", label: "Tất cả", color: "default" },
    { value: "BOOKED", label: "Đã đặt", color: "blue" },
    { value: "CHECKED_IN", label: "Đã check-in", color: "orange" },
    { value: "COMPLETED", label: "Hoàn thành", color: "green" },
    { value: "CANCELED", label: "Đã hủy", color: "red" },
  ];

  const getStatusTag = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    if (!option || option.value === "ALL") return null;
    return (
      <Tag color={option.color} icon={getStatusIcon(status)}>
        {option.label}
      </Tag>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "BOOKED":
        return <ClockCircleOutlined />;
      case "CHECKED_IN":
        return <ClockCircleOutlined />;
      case "COMPLETED":
        return <CheckCircleOutlined />;
      case "CANCELED":
        return <ClockCircleOutlined />;
      default:
        return null;
    }
  };

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings;

    const searchLower = searchTerm.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.customer?.fullName?.toLowerCase().includes(searchLower) ||
        booking.customer?.name?.toLowerCase().includes(searchLower) ||
        booking.customer?.phone?.toLowerCase().includes(searchLower) ||
        booking.vehicleTimeSlot?.vehicle?.code?.toLowerCase().includes(searchLower) ||
        booking.note?.toLowerCase().includes(searchLower)
    );
  }, [bookings, searchTerm]);

  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.customer?.fullName ||
              record.customer?.name ||
              "Không xác định"}
          </div>
          {record.customer?.phone && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.customer.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 180,
      render: (_, record) => (
        <div>
          {record.vehicleTimeSlot?.vehicle?.code ||
            record.vehicleTimeSlot?.vehicle?.vehicleVariant?.vehicleModel?.name ||
            "Không xác định"}
        </div>
      ),
    },
    {
      title: "Lịch",
      key: "schedule",
      width: 200,
      render: (_, record) => {
        const slotDate = record.vehicleTimeSlot?.slotDate;
        const masterSlot = record.vehicleTimeSlot?.masterTimeSlot;
        return (
          <div>
            {slotDate && (
              <div style={{ fontWeight: 500 }}>
                {moment(slotDate).format("DD/MM/YYYY")}
              </div>
            )}
            {masterSlot && (
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {masterSlot.code || "N/A"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: "Ngày đặt",
      key: "createdDate",
      width: 150,
      render: (_, record) =>
        record.createdDate
          ? moment(record.createdDate).format("DD/MM/YYYY HH:mm")
          : "N/A",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-staff/test-drives/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (loadingProfile) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
        </div>
      </Card>
    );
  }

  if (!dealerId) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Typography.Text type="danger">
            Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại.
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              <CarOutlined style={{ marginRight: "8px" }} />
              Đặt lịch lái thử
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/dealer-staff/test-drives/create")}
            >
              Tạo đặt lịch mới
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: "16px" }}>
            <Col span={12}>
              <Search
                placeholder="Tìm kiếm theo tên, SĐT khách hàng hoặc mã xe..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6}>
              <Select
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Typography.Text type="danger">{error}</Typography.Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.totalItems,
              showTotal: (total) => `Tổng cộng ${total} đặt lịch`,
              onChange: changePage,
              showSizeChanger: true,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default TestDriveBookingsPage;

