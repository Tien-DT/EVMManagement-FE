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
  Image
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import { contractService } from "../services/contractService";
import moment from "moment";

const { Title, Text } = Typography;

const ContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await contractService.getContractById(id);
      if (response && (response.success || response.data)) {
        setContract(response.data);
        console.log("✅ Contract details loaded:", response.data);
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

  const getStatusTag = (status) => {
    const statusConfig = {
      ACTIVE: { color: "green", text: "Đang hoạt động" },
      INACTIVE: { color: "red", text: "Không hoạt động" },
      PENDING: { color: "orange", text: "Đang chờ" },
      APPROVED: { color: "blue", text: "Đã duyệt" },
      REJECTED: { color: "red", text: "Đã từ chối" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Tag color={config.color} style={{ padding: "4px 8px", fontSize: "14px" }}>
        {config.text}
      </Tag>
    );
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

  return (
    <div className="contract-detail-page">
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết hợp đồng: {contract.code || contract.id}
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
                <Descriptions.Item label="ID">{contract.id}</Descriptions.Item>
                <Descriptions.Item label="Mã hợp đồng">{contract.code || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{getStatusTag(contract.status)}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {contract.createdDate ? moment(contract.createdDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {contract.modifiedDate ? moment(contract.modifiedDate).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày ký">
                  {contract.signedAt ? moment(contract.signedAt).format("DD/MM/YYYY HH:mm") : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Đã xóa">
                  {contract.isDeleted ? <Tag color="red">Đã xóa</Tag> : <Tag color="green">Đang hoạt động</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin liên kết">
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="ID Đơn hàng">{contract.orderId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Khách hàng">{contract.customerId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="ID Người tạo">{contract.createdByUserId || "N/A"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {contract.contractLink && (
            <Col span={24}>
              <Card type="inner" title="Tài liệu hợp đồng">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Link tài liệu hợp đồng:</Text>
                    <Button 
                      type="primary" 
                      icon={<FilePdfOutlined />}
                      onClick={() => window.open(contract.contractLink, '_blank')}
                    >
                      Xem tài liệu
                    </Button>
                  </div>
                  <Text>{contract.contractLink}</Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default ContractDetailPage;