// src/features/dealer-staff/pages/TestDriveDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Alert,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { testDriveService } from "../services/testDriveService";
import moment from "moment";

const { Title, Text } = Typography;

const TestDriveDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await testDriveService.getTestDriveBookingById(id);

      console.log("Test drive booking detail response:", response);

      if (response.success && response.data) {
        setBooking(response.data);
      } else if (response.data) {
        // Handle case where response.data is the booking directly
        setBooking(response.data);
      } else {
        message.error("Không tìm thấy thông tin đặt lịch");
        navigate("/dealer-staff/test-drives");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      message.error("Lỗi khi tải thông tin đặt lịch");
      navigate("/dealer-staff/test-drives");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    Modal.confirm({
      title: "Xác nhận check-in",
      content: "Bạn có chắc chắn muốn check-in đặt lịch này?",
      onOk: async () => {
        try {
          setUpdating(true);
          const response = await testDriveService.updateTestDriveBookingStatus(
            booking.id,
            "CHECKED_IN",
            {
              checkinAt: new Date().toISOString(),
            }
          );

          if (response.success || response.data) {
            message.success("Check-in thành công!");
            fetchBooking();
          } else {
            message.error(response.message || "Không thể check-in");
          }
        } catch (error) {
          console.error("Error checking in:", error);
          message.error(error.message || "Lỗi khi check-in");
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const handleCheckOut = async () => {
    if (!booking) return;

    Modal.confirm({
      title: "Xác nhận check-out",
      content: "Bạn có chắc chắn muốn check-out đặt lịch này?",
      onOk: async () => {
        try {
          setUpdating(true);
          const response = await testDriveService.updateTestDriveBookingStatus(
            booking.id,
            "COMPLETED",
            {
              checkoutAt: new Date().toISOString(),
            }
          );

          if (response.success || response.data) {
            message.success("Check-out thành công!");
            fetchBooking();
          } else {
            message.error(response.message || "Không thể check-out");
          }
        } catch (error) {
          console.error("Error checking out:", error);
          message.error(error.message || "Lỗi khi check-out");
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      BOOKED: { color: "blue", label: "Đã đặt", icon: <ClockCircleOutlined /> },
      CHECKED_IN: {
        color: "orange",
        label: "Đã check-in",
        icon: <ClockCircleOutlined />,
      },
      COMPLETED: {
        color: "green",
        label: "Hoàn thành",
        icon: <CheckCircleOutlined />,
      },
      CANCELED: { color: "red", label: "Đã hủy", icon: <ClockCircleOutlined /> },
    };

    const config = statusConfig[status] || statusConfig.BOOKED;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Không tìm thấy đặt lịch"
          description="Đặt lịch không tồn tại hoặc đã bị xóa"
          type="error"
          action={
            <Button onClick={() => navigate("/dealer-staff/test-drives")}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  const canCheckIn = booking.status === "BOOKED";
  const canCheckOut = booking.status === "CHECKED_IN";

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CarOutlined style={{ marginRight: "8px", fontSize: "20px" }} />
            <span className="text-xl font-bold">Chi tiết đặt lịch lái thử</span>
          </div>
        }
        extra={
          <Space>
            {canCheckIn && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleCheckIn}
                loading={updating}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Check-in
              </Button>
            )}
            {canCheckOut && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleCheckOut}
                loading={updating}
              >
                Check-out
              </Button>
            )}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dealer-staff/test-drives")}
            >
              Quay lại
            </Button>
          </Space>
        }
      >
        <Descriptions title="Thông tin đặt lịch" bordered column={2}>
          <Descriptions.Item label="Trạng thái" span={2}>
            {getStatusTag(booking.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Khách hàng" span={1}>
            <div>
              <div style={{ fontWeight: 500 }}>
                {booking.customer?.fullName ||
                  booking.customer?.name ||
                  "Không xác định"}
              </div>
              {booking.customer?.phone && (
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  {booking.customer.phone}
                </div>
              )}
              {booking.customer?.email && (
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  {booking.customer.email}
                </div>
              )}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Xe" span={1}>
            <div>
              <div style={{ fontWeight: 500 }}>
                {booking.vehicleTimeSlot?.vehicle?.code ||
                  booking.vehicleTimeSlot?.vehicle?.id ||
                  "Không xác định"}
              </div>
              {booking.vehicleTimeSlot?.vehicle?.vehicleVariant?.vehicleModel
                ?.name && (
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  {
                    booking.vehicleTimeSlot.vehicle.vehicleVariant.vehicleModel
                      .name
                  }
                </div>
              )}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày đặt lịch" span={1}>
            {booking.vehicleTimeSlot?.slotDate
              ? moment(booking.vehicleTimeSlot.slotDate).format(
                  "DD/MM/YYYY"
                )
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian" span={1}>
            {booking.vehicleTimeSlot?.masterTimeSlot ? (
              <div>
                {(() => {
                  const masterSlot = booking.vehicleTimeSlot.masterTimeSlot;
                  const startMinutes = masterSlot.startOffsetMinutes || 0;
                  const durationMinutes = masterSlot.durationMinutes || 60;
                  const hours = Math.floor(startMinutes / 60);
                  const minutes = startMinutes % 60;
                  const endHours = Math.floor(
                    (startMinutes + durationMinutes) / 60
                  );
                  const endMinutes = (startMinutes + durationMinutes) % 60;
                  return `${String(hours).padStart(2, "0")}:${String(
                    minutes
                  ).padStart(2, "0")} - ${String(endHours).padStart(
                    2,
                    "0"
                  )}:${String(endMinutes).padStart(2, "0")}`;
                })()}
              </div>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          {booking.checkinAt && (
            <Descriptions.Item label="Thời gian check-in" span={1}>
              {moment(booking.checkinAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
          )}

          {booking.checkoutAt && (
            <Descriptions.Item label="Thời gian check-out" span={1}>
              {moment(booking.checkoutAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Ngày tạo" span={1}>
            {booking.createdDate
              ? moment(booking.createdDate).format("DD/MM/YYYY HH:mm:ss")
              : "N/A"}
          </Descriptions.Item>

          {booking.note && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {booking.note}
            </Descriptions.Item>
          )}
        </Descriptions>

        {(canCheckIn || canCheckOut) && (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 24 }}
            message={
              canCheckIn
                ? "Khách hàng đã đến. Vui lòng nhấn 'Check-in' để bắt đầu lái thử."
                : "Khách hàng đang lái thử. Vui lòng nhấn 'Check-out' khi hoàn thành."
            }
          />
        )}
      </Card>
    </div>
  );
};

export default TestDriveDetailPage;

