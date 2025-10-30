// src/features/dealer-manager/components/OrderDetailModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Spin,
  message,
  Divider,
  Table,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Image,
} from "antd";
import {
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Title, Text } = Typography;

const OrderDetailModal = ({ visible, onClose, orderId }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (visible && orderId) {
      fetchOrderDetails();
    }
  }, [visible, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {

      const orderResponse = await axiosInstance.get(
        endpoints.orders.getByIdWithDetails(orderId)
      );
      
      if (!orderResponse.success || !orderResponse.data) {
        message.error("Không thể tải thông tin đơn hàng");
        setLoading(false);
        return;
      }

      console.log("📦 Order with details response:", orderResponse.data);
      const order = orderResponse.data;

      if (order.orderDetails && order.orderDetails.length > 0) {
        const detailsWithVehicles = await Promise.all(
          order.orderDetails.map(async (detail) => {
            console.log("📝 Processing order detail:", {
              id: detail.id,
              unitPrice: detail.unitPrice,
              vehicleId: detail.vehicleId,
              vehicleVariantId: detail.vehicleVariantId
            });

            if (detail.vehicleId) {
              try {
                const vehicleResponse = await axiosInstance.get(
                  endpoints.vehicles.getById(detail.vehicleId)
                );
                if (vehicleResponse.success && vehicleResponse.data) {
                  const vehicleData = vehicleResponse.data;
                  console.log("✅ Vehicle fetched:", {
                    vin: vehicleData.vin,
                    variantPrice: vehicleData.vehicleVariant?.price
                  });
                  return { ...detail, vehicle: vehicleData };
                }
              } catch (err) {
                console.error("⚠️ Error fetching vehicle:", err);
              }
            } else if (detail.vehicleVariantId) {
              try {
                const variantResponse = await axiosInstance.get(
                  endpoints.vehicleVariants.getById(detail.vehicleVariantId)
                );
                if (variantResponse.success && variantResponse.data) {
                  console.log("✅ Variant fetched:", {
                    color: variantResponse.data.color,
                    price: variantResponse.data.price
                  });
                  const pseudoVehicle = {
                    id: null,
                    vin: "N/A (Preorder)",
                    vehicleVariant: variantResponse.data
                  };
                  return { ...detail, vehicle: pseudoVehicle };
                }
              } catch (err) {
                console.error("⚠️ Error fetching variant:", err);
              }
            }
            return detail;
          })
        );
        order.orderDetails = detailsWithVehicles;
        console.log("🚗 Order with vehicles/variants:", order);
        
        // Log prices for debugging
        order.orderDetails.forEach((detail, index) => {
          const displayPrice = detail.unitPrice || detail.vehicle?.vehicleVariant?.price || 0;
          console.log(`💰 Detail ${index + 1} price:`, {
            unitPrice: detail.unitPrice,
            variantPrice: detail.vehicle?.vehicleVariant?.price,
            displayPrice: displayPrice
          });
        });
      }
      
      setOrderData(order);
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      message.error("Lỗi khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getOrderTypeTag = (orderType) => {
    if (orderType === 2 || orderType === "B2C_P") {
      return <Tag color="orange">Đặt trước</Tag>;
    } else if (orderType === 1 || orderType === "B2B") {
      return <Tag color="blue">B2B</Tag>;
    } else {
      return <Tag color="green">B2C</Tag>;
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      AWAITING_DEPOSIT: { color: "orange", text: "Chờ đặt cọc / Chờ báo giá" },
      IN_PROGRESS: { color: "cyan", text: "Đang xử lý" },
      READY_FOR_HANDOVER: { color: "purple", text: "Sẵn sàng bàn giao" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const vehicleColumns = [
    {
      title: "Hình ảnh",
      dataIndex: "vehicle",
      key: "image",
      width: 100,
      render: (vehicle) => (
        vehicle?.vehicleVariant?.imageUrl ? (
          <Image
            src={vehicle.vehicleVariant.imageUrl}
            alt="Vehicle"
            width={80}
            height={60}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <div style={{ 
            width: 80, 
            height: 60, 
            backgroundColor: "#f0f0f0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            borderRadius: 4
          }}>
            <CarOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
          </div>
        )
      ),
    },
    {
      title: "VIN",
      dataIndex: "vehicle",
      key: "vin",
      render: (vehicle) => vehicle?.vin || "N/A",
    },
    {
      title: "Màu sắc",
      dataIndex: "vehicle",
      key: "color",
      render: (vehicle) => vehicle?.vehicleVariant?.color || "N/A",
    },
    {
      title: "Động cơ",
      dataIndex: "vehicle",
      key: "engine",
      render: (vehicle) => vehicle?.vehicleVariant?.engine || "N/A",
    },
    {
      title: "Loại pin",
      dataIndex: "vehicle",
      key: "battery",
      render: (vehicle) => vehicle?.vehicleVariant?.batteryType || "N/A",
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      align: "right",
      render: (_, record) => {
        // Try to get price from unitPrice first, then from vehicle variant
        const price = record.unitPrice || record.vehicle?.vehicleVariant?.price || 0;
        return formatPrice(price);
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (qty) => qty || 1,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "-",
    },
  ];

  const depositColumns = [
    {
      title: "Mã cọc",
      dataIndex: "code",
      key: "code",
      render: (text) => text || "N/A",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => <Text strong style={{ color: "#52c41a" }}>{formatPrice(amount)}</Text>,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        const methods = {
          0: "Tiền mặt",
          1: "Chuyển khoản",
          2: "Thẻ tín dụng",
          3: "VNPay",
        };
        return methods[method] || "N/A";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          PENDING: <Tag color="orange">Chờ xử lý</Tag>,
          CONFIRMED: <Tag color="green">Đã xác nhận</Tag>,
          REFUNDED: <Tag color="red">Đã hoàn</Tag>,
        };
        return statusMap[status] || <Tag>{status}</Tag>;
      },
    },
    {
      title: "Ngày cọc",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (date) => date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A",
    },
  ];

  if (!orderData && !loading) {
    return null;
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Chi tiết đơn hàng</span>
        </div>
      }
      styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#666" }}>Đang tải thông tin...</p>
        </div>
      ) : orderData ? (
        <div>
          {/* Order Info Section */}
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1890ff" }} />
                <span>Thông tin đơn hàng</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Descriptions bordered column={3} size="small">
                  <Descriptions.Item label="Mã đơn hàng" span={1}>
                    <Text strong style={{ color: "#1890ff" }}>{orderData.code}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại đơn" span={1}>
                    {getOrderTypeTag(orderData.orderType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={1}>
                    {getStatusTag(orderData.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo" span={1}>
                    <Space>
                      <CalendarOutlined style={{ color: "#666" }} />
                      {moment(orderData.createdDate).format("DD/MM/YYYY HH:mm")}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày giao dự kiến" span={1}>
                    <Space>
                      <CalendarOutlined style={{ color: "#666" }} />
                      {orderData.expectedDeliveryAt 
                        ? moment(orderData.expectedDeliveryAt).format("DD/MM/YYYY")
                        : "Chưa xác định"}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trả góp" span={1}>
                    <Tag color={orderData.isFinanced ? "green" : "default"}>
                      {orderData.isFinanced ? "Có" : "Không"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Customer Info Section */}
          {orderData.customer && (
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: "#52c41a" }} />
                  <span>Thông tin khách hàng</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Họ tên">
                  <Text strong>{orderData.customer.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {orderData.customer.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {orderData.customer.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {orderData.customer.gender === "MALE" ? "Nam" : orderData.customer.gender === "FEMALE" ? "Nữ" : "Khác"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {orderData.customer.address || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="CCCD/CMND">
                  {orderData.customer.cardId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {orderData.customer.dob 
                    ? moment(orderData.customer.dob).format("DD/MM/YYYY")
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Vehicles Section */}
          {orderData.orderDetails && orderData.orderDetails.length > 0 && (
            <Card 
              title={
                <Space>
                  <CarOutlined style={{ color: "#fa8c16" }} />
                  <span>Danh sách xe ({orderData.orderDetails.length})</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Table
                columns={vehicleColumns}
                dataSource={orderData.orderDetails}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            </Card>
          )}

          {/* Deposits Section (for B2C_P orders) */}
          {(orderData.orderType === 2 || orderData.orderType === "B2C_P") && 
           orderData.deposits && orderData.deposits.length > 0 && (
            <Card 
              title={
                <Space>
                  <DollarOutlined style={{ color: "#13c2c2" }} />
                  <span>Thông tin đặt cọc ({orderData.deposits.length})</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Table
                columns={depositColumns}
                dataSource={orderData.deposits}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {/* Financial Summary */}
          <Card 
            title={
              <Space>
                <DollarOutlined style={{ color: "#722ed1" }} />
                <span>Tổng quan tài chính</span>
              </Space>
            }
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Tổng tiền hàng">
                <Text style={{ fontSize: 16 }}>{formatPrice(orderData.totalAmount)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <Text style={{ fontSize: 16, color: "#ff4d4f" }}>
                  {orderData.discountAmount > 0 ? `-${formatPrice(orderData.discountAmount)}` : "0 ₫"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thành tiền">
                <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                  {formatPrice(orderData.finalAmount)}
                </Text>
              </Descriptions.Item>
              
              {(orderData.orderType === 2 || orderData.orderType === "B2C_P") && orderData.deposits && (
                <>
                  <Descriptions.Item label="Đã đặt cọc">
                    <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                      {formatPrice(orderData.deposits.reduce((sum, d) => sum + d.amount, 0))}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn lại">
                    <Text strong style={{ fontSize: 16, color: "#fa8c16" }}>
                      {formatPrice(
                        orderData.finalAmount - 
                        orderData.deposits.reduce((sum, d) => sum + d.amount, 0)
                      )}
                    </Text>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {/* Additional Notes */}
          {orderData.notes && (
            <Card 
              title="Ghi chú"
              style={{ marginTop: 16 }}
            >
              <Text>{orderData.notes}</Text>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Text type="secondary">Không có dữ liệu</Text>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
