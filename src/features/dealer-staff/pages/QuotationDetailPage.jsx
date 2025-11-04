// src/features/dealer-staff/pages/QuotationDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Image
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FilePdfOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { quotationService } from "../services/quotationService";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Title, Text } = Typography;

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  // Get orderId from navigation state if available
  useEffect(() => {
    if (location.state?.orderId) {
      setOrderId(location.state.orderId);
      console.log('Received orderId from navigation:', location.state.orderId);
    }
  }, [location.state]);

  useEffect(() => {
    fetchQuotationDetails();
  }, [id]);

  const fetchQuotationDetails = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(id);
      if (response && (response.success || response.data)) {
        setQuotation(response.data);
        console.log("✅ Quotation details loaded:", response.data);
      } else {
        message.error("Không thể tải thông tin báo giá");
      }
    } catch (error) {
      console.error("❌ Error loading quotation details:", error);
      message.error("Lỗi khi tải thông tin báo giá");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      ACTIVE: { color: "green", text: "Đang hoạt động" },
      INACTIVE: { color: "red", text: "Không hoạt động" },
      PENDING: { color: "orange", text: "Đang chờ" },
      SENT: { color: "blue", text: "Đã gửi" },
      APPROVED: { color: "blue", text: "Đã duyệt" },
      ACCEPTED: { color: "green", text: "Đã chấp nhận" },
      REJECTED: { color: "red", text: "Đã từ chối" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Tag color={config.color} style={{ padding: "4px 8px", fontSize: "14px" }}>
        {config.text}
      </Tag>
    );
  };

  const handleAccept = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận báo giá này?")) {
      return;
    }

    try {
      setLoading(true);
      
      // Update quotation status
      await axiosInstance.put(endpoints.quotations.update(id), {
        ...quotation,
        status: "ACCEPTED",
      });
      message.success("Đã chấp nhận báo giá thành công!");
      
      // Update order status if orderId is available (from navigation state or quotation)
      const orderIdToUpdate = orderId || quotation.orderId || quotation.order?.id;
      if (orderIdToUpdate) {
        try {
          console.log('Updating order status for orderId:', orderIdToUpdate);
          
          // Get order details
          const orderResponse = await axiosInstance.get(
            endpoints.orders.getById(orderIdToUpdate)
          );
          const order = orderResponse.data?.data || orderResponse.data;
          
          if (order) {
            // Build order update payload
            const orderUpdateData = {
              code: order.code,
              dealerId: order.dealerId,
              status: 'QUOTATION_ACCEPTED',
              quotationId: id,
              orderType: order.orderType,
            };
            
            // Add optional fields if they exist
            if (order.customerId) orderUpdateData.customerId = order.customerId;
            if (order.handoverRecordId) orderUpdateData.handoverRecordId = order.handoverRecordId;
            if (order.contractId) orderUpdateData.contractId = order.contractId;
            if (order.depositId) orderUpdateData.depositId = order.depositId;
            if (order.note) orderUpdateData.note = order.note;
            if (order.totalAmount) orderUpdateData.totalAmount = order.totalAmount;
            if (order.discountAmount) orderUpdateData.discountAmount = order.discountAmount;
            if (order.finalAmount) orderUpdateData.finalAmount = order.finalAmount;
            if (order.handoverDate) orderUpdateData.handoverDate = order.handoverDate;
            if (order.expectedDeliveryAt) orderUpdateData.expectedDeliveryAt = order.expectedDeliveryAt;
            
            console.log('Order update payload:', orderUpdateData);
            
            // Update order
            await axiosInstance.put(
              endpoints.orders.update(orderIdToUpdate),
              orderUpdateData
            );
            
            console.log('Order status updated to QUOTATION_ACCEPTED');
            message.success('Đã cập nhật trạng thái đơn hàng thành công!');
          }
        } catch (orderError) {
          console.error('Error updating order status:', orderError);
          message.warning('Báo giá đã được chấp nhận nhưng không thể cập nhật trạng thái đơn hàng');
        }
      }
      
      fetchQuotationDetails(); // Refresh to show new status
    } catch (error) {
      console.error("Error accepting quotation:", error);
      message.error(error.response?.data?.message || "Không thể chấp nhận báo giá");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/dealer-staff/quotations/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo giá này không?")) {
      try {
        setLoading(true);
        const response = await quotationService.deleteQuotation(id);
        if (response && (response.success || response.data)) {
          message.success("Xóa báo giá thành công");
          navigate("/dealer-staff/quotations");
        } else {
          message.error("Không thể xóa báo giá");
        }
      } catch (error) {
        console.error("❌ Error deleting quotation:", error);
        message.error("Lỗi khi xóa báo giá");
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

  if (!quotation) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin báo giá</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dealer-staff/quotations")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="quotation-detail-page">
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết báo giá: {quotation.code || quotation.id}
              </Title>
              {getStatusTag(quotation.status)}
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/quotations")}
              >
                Quay lại
              </Button>
              {(quotation.status === "SENT" || quotation.status === "PENDING") && (
                <Button 
                  type="primary"
                  style={{ 
                    backgroundColor: "#10b981", 
                    borderColor: "#10b981",
                    opacity: 1,
                    fontWeight: 500
                  }}
                  icon={<CheckCircleOutlined />} 
                  onClick={handleAccept}
                >
                  Chấp nhận báo giá
                </Button>
              )}
              <Button 
                type="default" 
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
                <Descriptions.Item label="ID">{quotation.id}</Descriptions.Item>
                <Descriptions.Item label="Mã báo giá">{quotation.code || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{getStatusTag(quotation.status)}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {quotation.createdDate ? moment(quotation.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {quotation.modifiedDate ? moment(quotation.modifiedDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày ký">
                  {quotation.signedAt ? moment(quotation.signedAt).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Đã xóa">
                  {quotation.isDeleted ? <Tag color="red">Đã xóa</Tag> : <Tag color="green">Đang hoạt động</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin liên kết">
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="ID Khách hàng">{quotation.customerId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Người tạo">{quotation.createdByUserId || "N/A"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {quotation.contractLink && (
            <Col span={24}>
              <Card type="inner" title="Tài liệu báo giá">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Link tài liệu báo giá:</Text>
                    <Button 
                      type="primary" 
                      icon={<FilePdfOutlined />}
                      onClick={() => window.open(quotation.contractLink, '_blank')}
                    >
                      Xem tài liệu
                    </Button>
                  </div>
                  <Text>{quotation.contractLink}</Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default QuotationDetailPage;