// src/features/dealer-staff/pages/TestDriveBookingDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Descriptions, 
  Button, 
  Spin, 
  message, 
  Tag, 
  Row, 
  Col, 
  Typography,
  Space,
  Divider
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SendOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { testDriveBookingService } from "../services/testDriveBookingService";
import { useNotification } from "../../../context/NotificationContext";
import { useCreateTestDriveBooking } from "../hooks/useCreateTestDriveBooking";
import CheckInOutModal from "../components/CheckInOutModal";
import moment from "moment";

const { Title, Text } = Typography;

const TestDriveBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckInOutModal, setShowCheckInOutModal] = useState(false);
  const { sendConfirmation, updateCheckInOut, isSubmitting } = useCreateTestDriveBooking();

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await testDriveBookingService.getById(id);
      console.log("Test drive booking details response:", response);
      
      // Handle different response formats
      const bookingData = response?.data || response;
      
      if (bookingData) {
        setBooking(bookingData);
        console.log("✅ Test drive booking details loaded:", bookingData);
      } else {
        showError("Không thể tải thông tin đặt chỗ lái thử");
      }
    } catch (error) {
      console.error("❌ Error loading test drive booking details:", error);
      showError("Lỗi khi tải thông tin đặt chỗ lái thử");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      BOOKED: { color: "blue", text: "Đã đặt" },
      CHECKED_IN: { color: "orange", text: "Đã check-in" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Tag color={config.color} style={{ padding: "4px 8px", fontSize: "14px" }}>
        {config.text}
      </Tag>
    );
  };

  const handleSendConfirmation = async () => {
    if (window.confirm("Bạn có chắc chắn muốn gửi xác nhận cho đặt chỗ này?")) {
      const result = await sendConfirmation(id);
      if (result.success) {
        fetchBookingDetails(); // Refresh data
      }
    }
  };

  const handleOpenCheckInOut = () => {
    setShowCheckInOutModal(true);
  };

  const handleCloseCheckInOut = () => {
    setShowCheckInOutModal(false);
  };

  const handleUpdateCheckInOut = async (bookingId, checkinAt, checkoutAt, action) => {
    const result = await updateCheckInOut(bookingId, checkinAt, checkoutAt, action);
    if (result.success) {
      handleCloseCheckInOut();
      fetchBookingDetails(); // Refresh data
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đặt chỗ lái thử này không?")) {
      try {
        setLoading(true);
        const response = await testDriveBookingService.delete(id);
        console.log("Delete test drive booking response:", response);
        
        // Handle different response formats
        if (response?.success !== false) {
          showSuccess("Xóa đặt chỗ lái thử thành công");
          // Redirect to bookings list after 1 second
          setTimeout(() => {
            navigate("/dealer-staff/test-drive-bookings");
          }, 1000);
        } else {
          const errorMsg = response?.message || "Không thể xóa đặt chỗ lái thử";
          showError(errorMsg);
        }
      } catch (error) {
        console.error("❌ Error deleting test drive booking:", error);
        const errorMessage = error.response?.data?.message || error.message || "Lỗi khi xóa đặt chỗ lái thử";
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("DD/MM/YYYY HH:mm:ss");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("DD/MM/YYYY");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin đặt chỗ lái thử</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dealer-staff/test-drive-bookings")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="test-drive-booking-detail-page">
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết đặt chỗ lái thử
              </Title>
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/test-drive-bookings")}
              >
                Quay lại
              </Button>
              {booking.status === "BOOKED" && (
                <Button 
                  type="primary"
                  icon={<SendOutlined />} 
                  onClick={handleSendConfirmation}
                  disabled={isSubmitting}
                >
                  Gửi xác nhận
                </Button>
              )}
              <Button 
                icon={<ClockCircleOutlined />} 
                onClick={handleOpenCheckInOut}
                disabled={isSubmitting}
              >
                Check-in/Check-out
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
                disabled={loading}
              >
                Xóa
              </Button>
            </Space>
          </div>
        }
        bordered={false}
        className="card-with-shadow"
        style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}
      >
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card type="inner" title="Thông tin cơ bản">
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="ID">{booking.id}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{getStatusTag(booking.status)}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{booking.note || "Không có"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin khách hàng */}
          <Col span={24}>
            <Card 
              type="inner" 
              title={
                <Space>
                  <UserOutlined />
                  <span>Thông tin khách hàng</span>
                </Space>
              }
            >
              {booking.customer ? (
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="ID">{booking.customer.id}</Descriptions.Item>
                  <Descriptions.Item label="Họ tên">{booking.customer.fullName || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{booking.customer.phone || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Email">{booking.customer.email || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">{booking.customer.address || "N/A"}</Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">Không có thông tin khách hàng</Text>
              )}
            </Card>
          </Col>

          {/* Thông tin xe và thời gian */}
          <Col span={24}>
            <Card 
              type="inner" 
              title={
                <Space>
                  <CarOutlined />
                  <span>Thông tin xe và thời gian</span>
                </Space>
              }
            >
              {booking.vehicleTimeslot ? (
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="Tên xe">
                    {booking.vehicleTimeslot.vehicleName || 
                     booking.vehicleTimeslot.testDriveVehicle?.vehicleName || 
                     "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Slot thời gian">
                    {booking.vehicleTimeslot.slotName || 
                     booking.vehicleTimeslot.masterTimeSlot?.name || 
                     "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">
                    {booking.vehicleTimeslot.slotDate 
                      ? formatDate(booking.vehicleTimeslot.slotDate)
                      : "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">Không có thông tin xe và thời gian</Text>
              )}
            </Card>
          </Col>

          {/* Thông tin nhân viên */}
          <Col span={24}>
            <Card 
              type="inner" 
              title={
                <Space>
                  <UserOutlined />
                  <span>Thông tin nhân viên</span>
                </Space>
              }
            >
              {booking.dealerStaff ? (
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="ID">{booking.dealerStaff.id}</Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {booking.dealerStaff.fullName || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {booking.dealerStaff.phoneNumber || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">Không có thông tin nhân viên</Text>
              )}
            </Card>
          </Col>

          {/* Thông tin thời gian check-in/check-out */}
          <Col span={24}>
            <Card 
              type="inner" 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Thông tin check-in/check-out</span>
                </Space>
              }
            >
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Thời gian check-in">
                  {booking.checkinAt ? (
                    <Tag color="green">{formatDateTime(booking.checkinAt)}</Tag>
                  ) : (
                    <Text type="secondary">Chưa check-in</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian check-out">
                  {booking.checkoutAt ? (
                    <Tag color="orange">{formatDateTime(booking.checkoutAt)}</Tag>
                  ) : (
                    <Text type="secondary">Chưa check-out</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin thời gian */}
          <Col span={24}>
            <Card type="inner" title="Thông tin thời gian">
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Ngày tạo">
                  {booking.createdAt || booking.created_at 
                    ? formatDateTime(booking.createdAt || booking.created_at)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {booking.modifiedAt || booking.modified_at 
                    ? formatDateTime(booking.modifiedAt || booking.modified_at)
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Check-in/Check-out Modal */}
      <CheckInOutModal
        isOpen={showCheckInOutModal}
        onClose={handleCloseCheckInOut}
        booking={booking}
        onUpdate={handleUpdateCheckInOut}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TestDriveBookingDetailPage;

