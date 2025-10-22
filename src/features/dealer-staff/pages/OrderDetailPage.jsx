// src/features/dealer-staff/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Descriptions, 
  Button, 
  Spin, 
  message, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Typography,
  Space
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { orderService } from "../services/orderService";
import moment from "moment";

const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      if (response && (response.success || response.data)) {
        setOrder(response.data);
        console.log("✅ Order details loaded:", response.data);
      } else {
        message.error("Không thể tải thông tin đơn hàng");
      }
    } catch (error) {
      console.error("❌ Error loading order details:", error);
      message.error("Lỗi khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      AWAITING_DEPOSIT: { color: "orange", text: "Chờ đặt cọc" },
      IN_PROGRESS: { color: "processing", text: "Đang xử lý" },
      READY_FOR_HANDOVER: { color: "cyan", text: "Sẵn sàng bàn giao" },
      COMPLETED: { color: "success", text: "Hoàn thành" },
      CANCELED: { color: "error", text: "Đã hủy" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Tag color={config.color} style={{ padding: "4px 8px", fontSize: "14px" }}>
        {config.text}
      </Tag>
    );
  };

  const handleEdit = () => {
    navigate(`/dealer-staff/orders/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
      try {
        setLoading(true);
        const response = await orderService.deleteOrder(id);
        if (response && (response.success || response.data)) {
          message.success("Xóa đơn hàng thành công");
          navigate("/dealer-staff/orders");
        } else {
          message.error("Không thể xóa đơn hàng");
        }
      } catch (error) {
        console.error("❌ Error deleting order:", error);
        message.error("Lỗi khi xóa đơn hàng");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin đơn hàng</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dealer-staff/orders")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết đơn hàng: {order.code}
              </Title>
              {getStatusTag(order.status)}
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/orders")}
              >
                Quay lại
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
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
          <Col span={24}>
            <Card type="inner" title="Thông tin cơ bản">
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Mã đơn hàng">{order.code}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{getStatusTag(order.status)}</Descriptions.Item>
                <Descriptions.Item label="Loại đơn hàng">{order.orderType}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {order.createdDate ? moment(order.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {order.modifiedDate ? moment(order.modifiedDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao dự kiến">
                  {order.expectedDeliveryAt ? moment(order.expectedDeliveryAt).format("DD/MM/YYYY") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tài chính">
                  {order.isFinanced ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin thanh toán">
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong>{order.totalAmount?.toLocaleString() || 0} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  <Text type="danger">{order.discountAmount?.toLocaleString() || 0} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thành tiền">
                  <Text strong style={{ color: "#1890ff" }}>
                    {order.finalAmount?.toLocaleString() || 0} VNĐ
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin khách hàng và báo giá">
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="ID Khách hàng">{order.customerId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Báo giá">{order.quotationId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Đại lý">{order.dealerId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Người tạo">{order.createdByUserId || "N/A"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrderDetailPage;