// src/features/dealer-staff/pages/OrderDetailPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Table,
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DollarOutlined 
} from "@ant-design/icons";
import { orderService } from "../services/orderService";
import RemainingPaymentModal from "../components/RemainingPaymentModal";
import moment from "moment";

const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      let response;

      try {
        response = await orderService.getOrderByIdWithDetails(id);
      } catch (error) {
        console.warn("Failed to load order with details, falling back", error);
        response = await orderService.getOrderById(id);
      }

      if (response && (response.success || response.data)) {
        const payload = response.data ?? response;
        setOrderData(payload);
        console.log("✅ Order details loaded:", payload);
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

  const primaryOrder = useMemo(() => {
    if (!orderData) return null;
    if (orderData.order && Object.keys(orderData.order).length > 0) {
      return orderData.order;
    }
    return orderData;
  }, [orderData]);

  const orderDetails = useMemo(() => {
    const details = primaryOrder?.orderDetails ?? [];
    const seen = new Set();
    return details.filter((detail) => {
      const key = `${detail?.vehicleVariantId || detail?.vehicleModelId || "variant"}-${
        detail?.vehicleId || detail?.vin || detail?.note || ""
      }-${detail?.unitPrice || 0}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [primaryOrder]);

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

  const handlePaymentSuccess = (result) => {
    message.success("Thanh toán thành công!");
    fetchOrderDetails(); // Reload order details
  };

  const canShowPaymentButton = () => {
    return (
      primaryOrder?.status === "IN_PROGRESS" || primaryOrder?.status === 2
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!primaryOrder) {
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
    <div className="order-detail-page" style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card 
        bordered={false}
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          borderRadius: "12px",
          marginBottom: "24px"
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết đơn hàng: <span style={{ color: "#1890ff" }}>{primaryOrder.code}</span>
              </Title>
              {getStatusTag(primaryOrder.status)}
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/orders")}
              >
                Quay lại
              </Button>
              {canShowPaymentButton() && (
                <Button 
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => setPaymentModalVisible(true)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Thanh toán còn lại
                </Button>
              )}
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
      >
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card type="inner" title="📋 Thông tin cơ bản" style={{ borderRadius: "8px" }}>
              <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                <Descriptions.Item label="Trạng thái">{getStatusTag(primaryOrder.status)}</Descriptions.Item>
                <Descriptions.Item label="Loại đơn hàng">
                  <Tag color={primaryOrder.orderType === 2 ? "orange" : primaryOrder.orderType === 1 ? "blue" : "green"}>
                    {primaryOrder.orderType === 2 ? "Đặt trước" : primaryOrder.orderType === 1 ? "B2B" : "B2C"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tài chính">
                  {primaryOrder.isFinanced ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {primaryOrder.createdDate ? moment(primaryOrder.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {primaryOrder.modifiedDate ? moment(primaryOrder.modifiedDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao dự kiến">
                  {primaryOrder.expectedDeliveryAt ? moment(primaryOrder.expectedDeliveryAt).format("DD/MM/YYYY") : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin khách hàng */}
          {(orderData?.customer || primaryOrder?.customer) && (
            <Col span={24}>
              <Card type="inner" title="👤 Thông tin khách hàng" style={{ borderRadius: "8px" }}>
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                  <Descriptions.Item label="Họ tên" span={3}>
                    <Text strong>{orderData?.customer?.fullName || primaryOrder?.customer?.fullName || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {orderData?.customer?.email || primaryOrder?.customer?.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {orderData?.customer?.phone || primaryOrder?.customer?.phone || primaryOrder?.customer?.phoneNumber || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={3}>
                    {orderData?.customer?.address || primaryOrder?.customer?.address || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}

          {/* Thông tin thanh toán */}
          <Col span={24}>
            <Card type="inner" title="💰 Thông tin thanh toán" style={{ borderRadius: "8px", background: "linear-gradient(135deg, #ecf3ff 0%, #f6ffed 100%)" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Tổng tiền</Text>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#1890ff", marginTop: "4px" }}>
                      {primaryOrder.totalAmount?.toLocaleString() || 0} ₫
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Giảm giá</Text>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#ff4d4f", marginTop: "4px" }}>
                      {primaryOrder.discountAmount?.toLocaleString() || 0} ₫
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Thành tiền</Text>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#52c41a", marginTop: "4px" }}>
                      {primaryOrder.finalAmount?.toLocaleString() || 0} ₫
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Chi tiết đơn hàng */}
          {(orderDetails.length > 0) && (
            <Col span={24}>
              <Card type="inner" title="🚗 Chi tiết sản phẩm" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={orderDetails}
                  rowKey={(record) =>
                    record.id ||
                    `${record.vehicleId}-${record.vehicleVariantId}-${record.quantity}-${record.note || ""}`
                  }
                  pagination={false}
                  size="small"
                >
                  <Table.Column 
                    title="Mẫu xe" 
                    dataIndex="vehicleModelName" 
                    key="vehicleModelName"
                    render={(text) => text || "N/A"}
                  />
                  <Table.Column 
                    title="Biến thể" 
                    dataIndex="vehicleVariantName" 
                    key="vehicleVariantName"
                    render={(text) => text || "N/A"}
                  />
                  <Table.Column 
                    title="Số lượng" 
                    dataIndex="quantity" 
                    key="quantity"
                    align="center"
                  />
                  <Table.Column
                    title="Đơn giá"
                    dataIndex="unitPrice"
                    key="unitPrice"
                    align="right"
                    render={(value) => (value ? value.toLocaleString() + " ₫" : "N/A")}
                  />
                  <Table.Column 
                    title="Ghi chú" 
                    dataIndex="note" 
                    key="note"
                    render={(text) => text || "-"}
                  />
                </Table>
              </Card>
            </Col>
          )}

          {/* Thông tin đặt cọc */}
          {(primaryOrder?.deposits && primaryOrder.deposits.length > 0) && (
            <Col span={24}>
              <Card type="inner" title="💳 Thông tin đặt cọc" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={primaryOrder.deposits}
                  rowKey={(record) => record.id}
                  pagination={false}
                  size="small"
                >
                  <Table.Column title="Mã đặt cọc" dataIndex="code" key="code" />
                  <Table.Column
                    title="Số tiền"
                    dataIndex="amount"
                    key="amount"
                    align="right"
                    render={(value) => (value ? value.toLocaleString() + " ₫" : "N/A")}
                  />
                  <Table.Column 
                    title="Trạng thái" 
                    dataIndex="status" 
                    key="status"
                    render={(status) => {
                      const statusConfig = {
                        PENDING: { color: "orange", text: "Chờ xử lý" },
                        CONFIRMED: { color: "green", text: "Đã xác nhận" },
                        FAILED: { color: "red", text: "Thất bại" },
                      };
                      const config = statusConfig[status] || { color: "default", text: status };
                      return <Tag color={config.color}>{config.text}</Tag>;
                    }}
                  />
                  <Table.Column
                    title="Ngày tạo"
                    dataIndex="createdDate"
                    key="createdDate"
                    render={(value) => (value ? moment(value).format("DD/MM/YYYY HH:mm") : "N/A")}
                  />
                  <Table.Column 
                    title="Ghi chú" 
                    dataIndex="note" 
                    key="note"
                    render={(text) => text || "-"}
                  />
                </Table>
              </Card>
            </Col>
          )}

          {/* Thông tin hợp đồng (nếu có) */}
          {orderData && orderData !== primaryOrder && (
            <Col span={24}>
              <Card type="inner" title="📄 Thông tin hợp đồng" style={{ borderRadius: "8px" }}>
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                  <Descriptions.Item label="Mã hợp đồng">{orderData.code || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">{orderData.status ? getStatusTag(orderData.status) : "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {orderData.createdDate ? moment(orderData.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày ký">
                    {orderData.signedAt ? moment(orderData.signedAt).format("DD/MM/YYYY HH:mm") : "Chưa ký"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Liên kết hợp đồng" span={2}>
                    {orderData.contractLink ? (
                      <a href={orderData.contractLink} target="_blank" rel="noopener noreferrer">
                        {orderData.contractLink}
                      </a>
                    ) : "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}

          {/* Chữ ký số (nếu có) */}
          {(orderData?.digitalSignatures && orderData.digitalSignatures.length > 0) && (
            <Col span={24}>
              <Card type="inner" title="✍️ Chữ ký số" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={orderData.digitalSignatures}
                  rowKey={(record) => record.id}
                  pagination={false}
                  size="small"
                >
                  <Table.Column title="Người ký" dataIndex="signerName" key="signerName" />
                  <Table.Column title="Email" dataIndex="signerEmail" key="signerEmail" />
                  <Table.Column title="Vai trò" dataIndex="signerRole" key="signerRole" />
                  <Table.Column 
                    title="Trạng thái" 
                    dataIndex="status" 
                    key="status"
                    render={(status) => {
                      const statusConfig = {
                        PENDING: { color: "orange", text: "Chờ ký" },
                        SIGNED: { color: "green", text: "Đã ký" },
                        DECLINED: { color: "red", text: "Từ chối" },
                      };
                      const config = statusConfig[status] || { color: "default", text: status };
                      return <Tag color={config.color}>{config.text}</Tag>;
                    }}
                  />
                  <Table.Column
                    title="Ngày ký"
                    dataIndex="signedAt"
                    key="signedAt"
                    render={(value) => (value ? moment(value).format("DD/MM/YYYY HH:mm") : "Chưa ký")}
                  />
                </Table>
              </Card>
            </Col>
          )}
        </Row>
      </Card>

      <RemainingPaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        order={primaryOrder}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrderDetailPage;
