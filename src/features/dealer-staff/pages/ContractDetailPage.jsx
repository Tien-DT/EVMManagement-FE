// src/features/dealer-staff/pages/ContractDetailPage.jsx
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
  Table,
  Divider
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FilePdfOutlined,
  DownloadOutlined
} from "@ant-design/icons";
import { contractService } from "../services/contractService";
import moment from "moment";
import FileUpload from "../../../components/FileUpload";
import buildContractPdf from "../../../utils/pdf/contractPdfBuilder";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const { Title, Text } = Typography;

const ContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingContractLink, setUpdatingContractLink] = useState(false);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "0";
    }

    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(value));
    } catch (error) {
      console.warn("Currency format fallback", error);
      return `${Number(value).toLocaleString()} VNĐ`;
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await contractService.getContractById(id);
      if (response && (response.success || response.data)) {
        setContract(response.data);
      } else {
        message.error("Không thể tải thông tin hợp đồng");
      }
    } catch (error) {
      console.error("❌ Error loading contract details:", error);
      message.error("Lỗi khi tải thông tin hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!contract) {
      message.error("Không có dữ liệu hợp đồng để tạo PDF");
      return;
    }

    const orderRef = contract.order;
    const customerRef = contract.customer || orderRef?.customer;
    const creatorRef = contract.createdByUser;
    const orderItems = orderRef?.orderDetails || [];
    const depositItems = orderRef?.deposits || [];

    const statusLabelMap = {
      DRAFT: "Bản nháp",
      PENDING_SIGNATURE: "Chờ ký",
      ACTIVE: "Đang hoạt động",
      CANCELED: "Đã hủy",
    };
    const depositStatusMap = {
      PENDING: "Chờ xử lý",
      COMPLETED: "Hoàn thành",
      FAILED: "Thất bại",
      REFUNDED: "Đã hoàn tiền",
    };
    const orderStatusMap = {
      CONFIRMED: "Đã xác nhận",
      AWAITING_DEPOSIT: "Chờ đặt cọc",
      IN_PROGRESS: "Đã ký",
      READY_FOR_HANDOVER: "Sẵn sàng bàn giao",
      COMPLETED: "Hoàn thành",
      CANCELED: "Đã hủy",
    };

    const sections = [
      {
        title: "Thông tin hợp đồng",
        type: "keyValue",
        rows: [
          { label: "Mã hợp đồng", value: contract.code || contract.id },
          {
            label: "Ngày tạo",
            value: contract.createdDate
              ? moment(contract.createdDate).format("DD/MM/YYYY")
              : "N/A",
          },
          {
            label: "Trạng thái",
            value:
              statusLabelMap[contract.status?.toUpperCase?.()] ||
              contract.status ||
              "N/A",
          },
          {
            label: "Ngày ký",
            value: contract.signedAt
              ? moment(contract.signedAt).format("DD/MM/YYYY")
              : "Chưa ký",
          },
        ],
      },
      {
        title: "Thông tin khách hàng",
        type: "keyValue",
        rows: [
          {
            label: "Khách hàng",
            value:
              customerRef?.fullName ||
              customerRef?.name ||
              contract.customerId ||
              "N/A",
          },
          { label: "Email", value: customerRef?.email || "N/A" },
          {
            label: "Số điện thoại",
            value:
              customerRef?.phone || customerRef?.phoneNumber || "N/A",
          },
          { label: "Địa chỉ", value: customerRef?.address || "N/A" },
        ],
      },
      {
        title: "Thông tin đơn hàng",
        type: "keyValue",
        rows: [
          {
            label: "Mã đơn hàng",
            value: orderRef?.code || contract.orderId || "N/A",
          },
          {
            label: "Trạng thái đơn hàng",
            value:
              orderStatusMap[orderRef?.status?.toUpperCase?.()] ||
              orderRef?.status ||
              "N/A",
          },
          { label: "Loại đơn", value: orderRef?.orderType || "N/A" },
          {
            label: "Tổng tiền hàng",
            value: formatCurrency(orderRef?.totalAmount ?? 0),
          },
          {
            label: "Thành tiền",
            value: formatCurrency(orderRef?.finalAmount ?? 0),
          },
          {
            label: "Ngày giao dự kiến",
            value: orderRef?.expectedDeliveryAt
              ? moment(orderRef.expectedDeliveryAt).format("DD/MM/YYYY")
              : "N/A",
          },
        ],
      },
      orderItems.length
        ? {
            title: "Chi tiết sản phẩm",
            type: "cards",
            cards: orderItems.map((item, index) => ({
              title: `Sản phẩm ${index + 1}`,
              rows: [
                {
                  label: "Mẫu xe",
                  value:
                    item.vehicleVariant?.vehicleModel?.name || "N/A",
                },
                {
                  label: "Biến thể",
                  value:
                    item.vehicleVariant?.color ||
                    item.vehicleVariantId ||
                    "N/A",
                },
                {
                  label: "Số lượng",
                  value: item.quantity ?? "N/A",
                },
                {
                  label: "Đơn giá",
                  value: formatCurrency(item.unitPrice),
                },
                item.note
                  ? { label: "Ghi chú", value: item.note }
                  : null,
              ].filter(Boolean),
            })),
          }
        : null,
      depositItems.length
        ? {
            title: "Lịch sử đặt cọc",
            type: "cards",
            cards: depositItems.map((deposit, index) => ({
              title: `Đặt cọc ${index + 1}`,
              rows: [
                {
                  label: "Mã",
                  value: deposit.code || deposit.id || "N/A",
                },
                {
                  label: "Số tiền",
                  value: formatCurrency(deposit.amount),
                },
                {
                  label: "Trạng thái",
                  value:
                    depositStatusMap[deposit.status?.toUpperCase?.()] ||
                    deposit.status ||
                    "N/A",
                },
                deposit.createdAt
                  ? {
                      label: "Ngày tạo",
                      value: moment(deposit.createdAt).format(
                        "DD/MM/YYYY"
                      ),
                    }
                  : null,
              ].filter(Boolean),
            })),
          }
        : null,
      {
        title: "Điều khoản",
        type: "text",
        text: contract.terms || "",
      },
    ].filter(Boolean);

    const doc = buildContractPdf({
      title: `Hợp đồng mua bán ${contract.code || contract.id}`,
      sections,
      signature: {
        leftLabel: "Bên bán",
        rightLabel: "Bên mua",
        preparedBy: creatorRef?.fullName
          ? `${creatorRef.fullName}${
              creatorRef.phone ? ` (${creatorRef.phone})` : ""
            }`
          : undefined,
      },
    });

    doc.save(`HopDong_${contract.code || contract.id}.pdf`);
    message.success("Đã tạo file hợp đồng PDF.");
  };

  const handleSignedContractUpload = async (url) => {
    try {
      if (typeof url === "undefined") {
        return;
      }
      setUpdatingContractLink(true);
      
      console.log('📄 Uploading contract PDF, URL:', url);
      console.log('📄 Current contract:', contract);
      
      // 1. Update contract with all fields + status ACTIVE + contractLink + signedAt
      // Build contract update data with all non-null fields
      const contractUpdateData = {
        code: contract.code,
        orderId: contract.orderId,
        customerId: contract.customerId || null,
        dealerId: contract.dealerId || null,
        createdByUserId: contract.createdByUserId,
        signedByUserId: contract.signedByUserId || null,
        contractType: contract.contractType || 'B2C',
        terms: contract.terms || '',
        status: url ? 'ACTIVE' : contract.status, // Change status to ACTIVE when PDF uploaded
        signedAt: url ? new Date().toISOString() : contract.signedAt, // Set signedAt to now when PDF uploaded
        contractLink: url || null, // Set contractLink to uploaded file URL
      };
      
      console.log('📄 Contract update payload:', contractUpdateData);
      
      const response = await axiosInstance.put(
        endpoints.contracts.update(id),
        contractUpdateData
      );
      
      if (response && (response.success || response.data)) {
        message.success(
          url ? "Đã upload PDF hợp đồng thành công!" : "Đã xoá tài liệu hợp đồng."
        );
        
        // 2. Auto update order status to COMPLETED if PDF uploaded
        if (url && contract.orderId) {
          try {
            console.log('📦 Updating order status to COMPLETED...');
            
            // Load current order data first
            const orderResponse = await axiosInstance.get(endpoints.orders.getById(contract.orderId));
            const currentOrder = orderResponse.data || orderResponse;
            
            if (currentOrder) {
              // Build update data with all non-null fields
              const orderUpdateData = {
                code: currentOrder.code,
                dealerId: currentOrder.dealerId,
                status: 'COMPLETED', // Update status
                orderType: currentOrder.orderType,
              };
              
              // Add optional fields if they exist
              if (currentOrder.customerId) orderUpdateData.customerId = currentOrder.customerId;
              if (currentOrder.quotationId) orderUpdateData.quotationId = currentOrder.quotationId;
              if (currentOrder.handoverRecordId) orderUpdateData.handoverRecordId = currentOrder.handoverRecordId;
              if (currentOrder.contractId) orderUpdateData.contractId = currentOrder.contractId;
              if (currentOrder.depositId) orderUpdateData.depositId = currentOrder.depositId;
              if (currentOrder.note) orderUpdateData.note = currentOrder.note;
              if (currentOrder.totalAmount) orderUpdateData.totalAmount = currentOrder.totalAmount;
              if (currentOrder.discount) orderUpdateData.discount = currentOrder.discount;
              if (currentOrder.finalAmount) orderUpdateData.finalAmount = currentOrder.finalAmount;
              if (currentOrder.handoverDate) orderUpdateData.handoverDate = currentOrder.handoverDate;
              
              // Update order with PUT
              await axiosInstance.put(
                endpoints.orders.update(contract.orderId),
                orderUpdateData
              );
              message.success('Đã tự động cập nhật trạng thái order → Hoàn thành');
            }
          } catch (statusError) {
            console.error('Error updating order status:', statusError);
            message.warning('Upload thành công nhưng không thể tự động cập nhật trạng thái order');
          }
        }
        
        await fetchContractDetails();
      } else {
        message.error("Không thể cập nhật tài liệu hợp đồng");
      }
    } catch (error) {
      console.error("❌ Error updating contract file:", error);
      message.error("Lỗi khi cập nhật tài liệu hợp đồng");
    } finally {
      setUpdatingContractLink(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: "default", text: "Bản nháp" },
      PENDING_SIGNATURE: { color: "orange", text: "Chờ ký" },
      ACTIVE: { color: "green", text: "Đã ký" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };

    const normalizedStatus = status?.toUpperCase?.() || "";
    const config = statusConfig[normalizedStatus] || {
      color: "default",
      text: normalizedStatus || "Không xác định",
    };
    return (
      <Tag color={config.color} style={{ padding: "4px 8px", fontSize: "14px" }}>
        {config.text}
      </Tag>
    );
  };

  const getOrderStatusTag = (status) => {
    const map = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      AWAITING_DEPOSIT: { color: "orange", text: "Chờ đặt cọc" },
      IN_PROGRESS: { color: "green", text: "Đã ký" },
      READY_FOR_HANDOVER: { color: "cyan", text: "Sẵn sàng bàn giao" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };

    const normalized = status?.toUpperCase?.() || "";
    const config = map[normalized] || {
      color: "default",
      text: normalized || "Không xác định",
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleEdit = () => {
    navigate(`/dealer-staff/contracts/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) {
      try {
        setLoading(true);
        const response = await contractService.deleteContract(id);
        if (response && (response.success || response.data)) {
          message.success("Xóa hợp đồng thành công");
          navigate("/dealer-staff/contracts");
        } else {
          message.error("Không thể xóa hợp đồng");
        }
      } catch (error) {
        console.error("❌ Error deleting contract:", error);
        message.error("Lỗi khi xóa hợp đồng");
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

  if (!contract) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin hợp đồng</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dealer-staff/contracts")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const order = contract.order;
  const customer = contract.customer || order?.customer;
  const createdByUser = contract.createdByUser;
  const orderDetails = order?.orderDetails || [];
  const digitalSignatures = contract.digitalSignatures || [];
  const deposits = order?.deposits || [];

  const orderDetailColumns = [
    {
      title: "Mẫu xe",
      key: "vehicleModel",
      render: (_, record) =>
        record.vehicleVariant?.vehicleModel?.name || "N/A",
    },
    {
      title: "Biến thể",
      key: "vehicleVariant",
      render: (_, record) =>
        record.vehicleVariant?.color || record.vehicleVariantId || "N/A",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
  ];

  const digitalSignatureColumns = [
    {
      title: "Người ký",
      dataIndex: "signerName",
      key: "signerName",
    },
    {
      title: "Email",
      dataIndex: "signerEmail",
      key: "signerEmail",
    },
    {
      title: "Vai trò",
      dataIndex: "signerRole",
      key: "signerRole",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const map = {
          SIGNED: { color: "green", text: "Đã ký" },
          PENDING: { color: "orange", text: "Đang chờ" },
          REJECTED: { color: "red", text: "Từ chối" },
        };
        const normalized = status?.toUpperCase?.() || "";
        const config = map[normalized] || {
          color: "default",
          text: normalized || "Không xác định",
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày ký",
      dataIndex: "signedAt",
      key: "signedAt",
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "Chưa ký",
    },
  ];

  const depositColumns = [
    {
      title: "Mã đặt cọc",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "N/A",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
  ];

  return (
    <div className="contract-detail-page" style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
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
                Chi tiết hợp đồng: <span style={{ color: "#1890ff" }}>{contract.code}</span>
              </Title>
              {getStatusTag(contract.status)}
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/contracts")}
              >
                Quay lại
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadPdf}
              >
                Tải hợp đồng PDF
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
      >
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card type="inner" title="📋 Thông tin cơ bản" style={{ borderRadius: "8px" }}>
              <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                <Descriptions.Item label="Trạng thái">{getStatusTag(contract.status)}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {contract.createdDate ? moment(contract.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {contract.modifiedDate ? moment(contract.modifiedDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày ký">
                  {contract.signedAt ? moment(contract.signedAt).format("DD/MM/YYYY HH:mm") : "Chưa ký"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin khách hàng */}
          {customer && (
            <Col span={24}>
              <Card type="inner" title="👤 Thông tin khách hàng" style={{ borderRadius: "8px" }}>
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                  <Descriptions.Item label="Họ tên" span={3}>
                    <Text strong>{customer.fullName || customer.name || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {customer.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {customer.phone || customer.phoneNumber || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={3}>
                    {customer.address || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}

          {/* Thông tin đơn hàng */}
          {order && (
            <Col span={24}>
              <Card type="inner" title="🛍️ Thông tin đơn hàng" style={{ borderRadius: "8px", background: "linear-gradient(135deg, #ecf3ff 0%, #f6ffed 100%)" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Mã đơn hàng</Text>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#1890ff", marginTop: "4px" }}>
                        {order.code || order.id}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Trạng thái đơn</Text>
                      <div style={{ marginTop: "4px" }}>
                        {getOrderStatusTag(order.status)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Ngày giao</Text>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#52c41a", marginTop: "4px" }}>
                        {order.expectedDeliveryAt ? moment(order.expectedDeliveryAt).format("DD/MM/YYYY") : "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}

          {/* Thông tin thanh toán */}
          {order && (
            <Col span={24}>
              <Card type="inner" title="💰 Thông tin thanh toán" style={{ borderRadius: "8px", background: "linear-gradient(135deg, #ecf3ff 0%, #f6ffed 100%)" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Tổng tiền</Text>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#1890ff", marginTop: "4px" }}>
                        {formatCurrency(order.totalAmount ?? 0)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Giảm giá</Text>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#ff4d4f", marginTop: "4px" }}>
                        {formatCurrency(order.discountAmount ?? 0)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Thành tiền</Text>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#52c41a", marginTop: "4px" }}>
                        {formatCurrency(order.finalAmount ?? 0)}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}

          {/* Chi tiết sản phẩm */}
          {orderDetails.length > 0 && (
            <Col span={24}>
              <Card type="inner" title="🚗 Chi tiết sản phẩm" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={orderDetails}
                  columns={orderDetailColumns}
                  rowKey={(record) => record.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}

          {/* Danh sách đặt cọc */}
          {deposits.length > 0 && (
            <Col span={24}>
              <Card type="inner" title="💳 Danh sách đặt cọc" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={deposits}
                  columns={depositColumns}
                  rowKey={(record) => record.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}

          {/* Chữ ký số */}
          {digitalSignatures.length > 0 && (
            <Col span={24}>
              <Card type="inner" title="✍️ Chữ ký số" style={{ borderRadius: "8px" }}>
                <Table
                  dataSource={digitalSignatures}
                  columns={digitalSignatureColumns}
                  rowKey={(record) => record.id}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}

          {/* Tài liệu hợp đồng */}
          <Col span={24}>
            <Card type="inner" title="📄 Tài liệu hợp đồng" style={{ borderRadius: "8px" }}>
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <Text>
                  Sử dụng nút "Tải hợp đồng PDF" để tải bản nháp. Sau khi ký, tải file PDF đã ký lên đây để lưu trữ.
                </Text>
                <Spin spinning={updatingContractLink} tip="Đang cập nhật tài liệu...">
                  <FileUpload
                    acceptedFileTypes=".pdf"
                    onUploadComplete={handleSignedContractUpload}
                    maxFileSize={20}
                  />
                </Spin>
                {contract.contractLink ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Divider style={{ margin: "8px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <Text strong>File hợp đồng đã ký hiện tại:</Text>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        href={contract.contractLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem hợp đồng đã ký
                      </Button>
                    </div>
                    <Text ellipsis style={{ wordBreak: "break-all" }}>
                      {contract.contractLink}
                    </Text>
                  </Space>
                ) : (
                  <Text type="secondary">
                    Chưa có tài liệu hợp đồng đã ký được tải lên.
                  </Text>
                )}
              </Space>
            </Card>
          </Col>

          {/* Điều khoản */}
          {contract.terms && (
            <Col span={24}>
              <Card type="inner" title="📝 Điều khoản" style={{ borderRadius: "8px" }}>
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {contract.terms}
                </Text>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default ContractDetailPage;
