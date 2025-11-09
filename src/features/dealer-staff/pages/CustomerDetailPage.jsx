// src/features/dealer-staff/pages/CustomerDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Descriptions, 
  Button, 
  Spin, 
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
import { customerService } from "../services/customerService";
import { useNotification } from "../../../context/NotificationContext";
import moment from "moment";

const { Title, Text } = Typography;

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomerById(id);
      console.log("Customer details response:", response);
      
      // Handle different response formats
      const customerData = response?.data || response;
      
      if (customerData) {
        setCustomer(customerData);
        console.log("✅ Customer details loaded:", customerData);
      } else {
        showError("Không thể tải thông tin khách hàng");
      }
    } catch (error) {
      console.error("❌ Error loading customer details:", error);
      showError("Lỗi khi tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const getGenderTag = (gender) => {
    if (gender === "MALE") {
      return <Tag color="blue">Nam</Tag>;
    } else if (gender === "FEMALE") {
      return <Tag color="pink">Nữ</Tag>;
    } else {
      return <Tag color="default">{gender || "Không xác định"}</Tag>;
    }
  };

  const handleEdit = () => {
    navigate(`/dealer-staff/customers/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
      try {
        setLoading(true);
        const response = await customerService.deleteCustomer(id);
        console.log("Delete customer response:", response);
        
        // Handle different response formats
        // DELETE API might return: {success: true} or just 200 OK with no body
        if (response?.success !== false) {
          showSuccess("Xóa khách hàng thành công");
          // Redirect to customers list after 1 second
          setTimeout(() => {
            navigate("/dealer-staff/customers");
          }, 1000);
        } else {
          const errorMsg = response?.message || "Không thể xóa khách hàng";
          showError(errorMsg);
        }
      } catch (error) {
        console.error("❌ Error deleting customer:", error);
        const errorMessage = error.message || "Lỗi khi xóa khách hàng";
        showError(errorMessage);
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

  if (!customer) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Không tìm thấy thông tin khách hàng</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dealer-staff/customers")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-detail-page">
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết khách hàng: {customer.fullName}
              </Title>
            </Space>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/dealer-staff/customers")}
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
                <Descriptions.Item label="ID">{customer.id}</Descriptions.Item>
                <Descriptions.Item label="Họ tên">{customer.fullName}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{getGenderTag(customer.gender)}</Descriptions.Item>
                <Descriptions.Item label="Email">{customer.email || "Không có"}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{customer.phone || "Không có"}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{customer.address || "Không có"}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {customer.dob ? moment(customer.dob).format("DD/MM/YYYY") : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Số CMND/CCCD">{customer.cardId || "Không có"}</Descriptions.Item>
                <Descriptions.Item label="Đã xóa">
                  {customer.isDeleted ? <Tag color="red">Đã xóa</Tag> : <Tag color="green">Đang hoạt động</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin thời gian">
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Ngày tạo">
                  {customer.createdDate ? moment(customer.createdDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {customer.modifiedDate ? moment(customer.modifiedDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CustomerDetailPage;