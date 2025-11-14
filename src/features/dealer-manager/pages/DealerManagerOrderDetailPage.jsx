// src/features/dealer-manager/pages/DealerManagerOrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Descriptions,
  Tag,
  Spin,
  message,
  Table,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";
import AcceptQuotationModal from "../components/AcceptQuotationModal";
import DepositModal from "../components/DepositModal";
import FinalPaymentModal from "../components/FinalPaymentModal";

const { Title, Text } = Typography;

const DealerManagerOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [quotationModalVisible, setQuotationModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [finalPaymentModalVisible, setFinalPaymentModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const orderResponse = await axiosInstance.get(
        endpoints.orders.getByIdWithDetails(id)
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
            if (detail.vehicleId) {
              try {
                const vehicleResponse = await axiosInstance.get(
                  endpoints.vehicles.getById(detail.vehicleId)
                );
                if (vehicleResponse.success && vehicleResponse.data) {
                  return { ...detail, vehicle: vehicleResponse.data };
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
      AWAITING_CONFIRM: { color: "orange", text: "Chờ EVM xác nhận" },
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      QUOTATION_RECEIVED: { color: "purple", text: "Đã nhận báo giá" },
      QUOTATION_ACCEPTED: { color: "blue", text: "Đã chấp nhận báo giá" },
      CREATED_CONTRACT: { color: "purple", text: "Đã tạo hợp đồng" },
      SIGNED_CONTRACT: { color: "geekblue", text: "EVM đã ký" },
      DEALER_SIGNED_CONTRACT: { color: "blue", text: "Dealer đã ký" },
      AWAITING_DEPOSIT: { color: "orange", text: "Chờ đặt cọc" },
      DEPOSIT_SUCCESS: { color: "cyan", text: "Đã đặt cọc" },
      IN_PROGRESS: { color: "cyan", text: "Đang xử lý" },
      IN_TRANSIT: { color: "processing", text: "Đang vận chuyển" },
      READY_FOR_HANDOVER: { color: "purple", text: "Sẵn sàng bàn giao" },
      PAY_SUCCESS: { color: "green", text: "Đã thanh toán thành công" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleViewQuotation = async () => {
    if (orderData?.quotationId) {
      navigate(`/dealer/quotations/${orderData.quotationId}`);
      return;
    }
    
    // If quotationId not in order, try to find it by orderId
    message.loading({ content: "Đang tải thông tin báo giá...", key: "loadQuotation" });
    try {
      // Fetch all quotations for this dealer and find by orderId
      const response = await axiosInstance.get(endpoints.quotations.getAll);
      if (response.success && response.data) {
        const quotation = response.data.find(q => q.orderId === orderData.id);
        if (quotation) {
          message.destroy("loadQuotation");
          navigate(`/dealer/quotations/${quotation.id}`);
        } else {
          message.error({ content: "Không tìm thấy báo giá", key: "loadQuotation" });
        }
      }
    } catch (error) {
      console.error("Error fetching quotation:", error);
      message.error({ content: "Lỗi khi tải thông tin báo giá", key: "loadQuotation" });
    }
  };

  const handleDeposit = () => {
    setDepositModalVisible(true);
  };

  const handleFinalPayment = () => {
    setFinalPaymentModalVisible(true);
  };

  const handleAddToB2BCart = async () => {
    message.loading({ content: "Đang thêm vào giỏ hàng...", key: "addCart" });
    
    try {
      const newItems = [];
      
      for (const detail of orderData.orderDetails || []) {
        if (detail.vehicleId) {
          try {
            const vehicleResponse = await axiosInstance.get(
              endpoints.vehicles.getById(detail.vehicleId)
            );
            
            if (vehicleResponse.success && vehicleResponse.data) {
              const vehicle = vehicleResponse.data;
              const variant = vehicle.vehicleVariant;
              
              if (variant) {
                newItems.push({
                  vehicleId: vehicle.id,
                  vin: vehicle.vin,
                  variantId: variant.id,
                  color: variant.color,
                  price: variant.price,
                  imageUrl: variant.imageUrl,
                  engine: variant.engine,
                  batteryType: variant.batteryType,
                });
              }
            }
          } catch (err) {
            console.error("Error fetching vehicle:", err);
          }
        } else if (detail.vehicleVariantId) {
          try {
            const variantResponse = await axiosInstance.get(
              endpoints.vehicleVariants.getById(detail.vehicleVariantId)
            );
            
            if (variantResponse.success && variantResponse.data) {
              const variant = variantResponse.data;
              
              let modelName = "Unknown Model";
              
              if (variant.modelName && variant.modelName !== "Unknown") {
                modelName = variant.modelName;
              } else if (variant.vehicleModel?.name) {
                modelName = variant.vehicleModel.name;
              } else if (variant.modelId) {
                try {
                  const modelResponse = await axiosInstance.get(
                    endpoints.vehicleModels.getById(variant.modelId)
                  );
                  if (modelResponse.success && modelResponse.data) {
                    modelName = modelResponse.data.name;
                  }
                } catch (err) {
                  console.error("Error fetching model:", err);
                }
              }
              
              newItems.push({
                vehicleId: null, 
                vin: null, 
                variantId: variant.id,
                color: variant.color,
                price: variant.price,
                imageUrl: variant.imageUrl,
                engine: variant.engine,
                batteryType: variant.batteryType,
                vehicleModelName: modelName,
                quantity: detail.quantity || 1, 
              });
            }
          } catch (err) {
            console.error("❌ Error fetching variant:", err);
          }
        }
      }

      if (newItems.length > 0) {
        // Get existing cart from localStorage
        const savedCart = localStorage.getItem("dealerManagerB2BCart");
        let existingCart = [];
        if (savedCart) {
          try {
            existingCart = JSON.parse(savedCart);
          } catch (err) {
            console.error("Error loading cart:", err);
          }
        }
        
        const existingIds = existingCart.map(item => item.vehicleId);
        const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.vehicleId));
        
        if (uniqueNewItems.length === 0) {
          message.warning({ content: "Các xe này đã có trong giỏ hàng", key: "addCart" });
          return;
        }
        
        const updatedCart = [...existingCart, ...uniqueNewItems];
        localStorage.setItem("dealerManagerB2BCart", JSON.stringify(updatedCart));
        
        message.success({ 
          content: `Đã thêm ${uniqueNewItems.length} xe vào giỏ hàng B2B. Đang chuyển hướng...`, 
          key: "addCart",
          duration: 2
        });
        
        // Redirect to orders page after 1 second
        setTimeout(() => {
          navigate("/dealer/orders");
        }, 1000);
      } else {
        message.warning({ content: "Không có xe nào được thêm vào giỏ hàng", key: "addCart" });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error({ content: "Lỗi khi thêm xe vào giỏ hàng", key: "addCart" });
    }
  };

  const handleDepositSuccess = () => {
    setDepositModalVisible(false);
    fetchOrderDetails(); // Refresh data
  };

  const handleFinalPaymentSuccess = () => {
    setFinalPaymentModalVisible(false);
    fetchOrderDetails(); // Refresh data
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#666" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Text type="secondary">Không tìm thấy đơn hàng</Text>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const isB2B = orderData.orderType === 1 || orderData.orderType === "B2B";
  const isPreorder = orderData.orderType === 2 || orderData.orderType === "B2C_P";
  const isB2C = orderData.orderType === 0 || orderData.orderType === "B2C";

  // Debug log
  console.log("🔍 Order Debug:", {
    orderType: orderData.orderType,
    status: orderData.status,
    isB2B,
    isPreorder,
    quotationId: orderData.quotationId,
  });

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Space size="large">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/dealer/orders")}
            >
              Quay lại
            </Button>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết đơn hàng
              </Title>
              <Text type="secondary">Mã: {orderData.code}</Text>
            </div>
          </Space>

          <Space>
            {/* Preorder - Add to B2B Cart Button */}
            {isPreorder && orderData.status === "AWAITING_CONFIRM" && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToB2BCart}
                style={{ 
                  backgroundColor: "#1890ff", 
                  borderColor: "#1890ff",
                  color: "#ffffff",
                  opacity: 1,
                }}
              >
                Đặt xe (B2B)
              </Button>
            )}

            {/* Preorder - Add to Cart Button for IN_PROGRESS status (Repeat Order) */}
            {isPreorder && orderData.status === "IN_PROGRESS" && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToB2BCart}
                style={{ 
                  backgroundColor: "#1890ff", 
                  borderColor: "#1890ff",
                  color: "#ffffff",
                  opacity: 1,
                }}
              >
                Đặt xe (B2B)
              </Button>
            )}

            {/* B2B Orders - View Quotation */}
            {isB2B && orderData.status === "QUOTATION_RECEIVED" && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleViewQuotation}
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  color: '#ffffff',
                  opacity: 1,
                }}
              >
                Xem báo giá
              </Button>
            )}

            {/* Deposit Button - for B2B orders */}
            {isB2B && orderData.status === "AWAITING_DEPOSIT" && (
              <Button
                type="primary"
                icon={<DollarCircleOutlined />}
                onClick={handleDeposit}
                style={{ 
                  backgroundColor: "#52c41a", 
                  borderColor: "#52c41a",
                  color: "#ffffff",
                  opacity: 1,
                }}
              >
                Đặt cọc
              </Button>
            )}

            {/* Final Payment Button - for B2B orders */}
            {isB2B && orderData.status === "READY_FOR_HANDOVER" && (
              <Button
                type="primary"
                icon={<DollarCircleOutlined />}
                onClick={handleFinalPayment}
                style={{ 
                  backgroundColor: "#722ed1", 
                  borderColor: "#722ed1",
                  color: "#ffffff",
                  opacity: 1,
                }}
              >
                Trả tiền còn lại
              </Button>
            )}
          </Space>
        </div>
      </Card>

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

      {/* Modals */}
      <AcceptQuotationModal
        visible={quotationModalVisible}
        onClose={() => setQuotationModalVisible(false)}
        quotationId={orderData?.quotationId}
        orderId={orderData?.id}
        onSuccess={() => {
          setQuotationModalVisible(false);
          fetchOrderDetails();
        }}
      />

      <DepositModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        order={orderData}
        onSuccess={handleDepositSuccess}
      />

      <FinalPaymentModal
        visible={finalPaymentModalVisible}
        onClose={() => setFinalPaymentModalVisible(false)}
        order={orderData}
        onSuccess={handleFinalPaymentSuccess}
      />
    </div>
  );
};

export default DealerManagerOrderDetailPage;
