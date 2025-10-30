// src/features/dealer-manager/pages/DealerContractDetailPage.jsx
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
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";
import DealerManagerSignatureModal from "../components/DealerManagerSignatureModal";
import useDigitalSignature from "../hooks/useDigitalSignature";

const { Title, Text } = Typography;

const DealerContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const { checkIfSigned } = useDigitalSignature();

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        endpoints.dealerContracts.getById(id)
      );
      const contractData = response.data || response;
      setContract(contractData);

      // Kiểm tra xem contract đã được ký chưa
      const signed = await checkIfSigned("DealerContract", id);
      setIsSigned(signed);

      console.log("✅ Dealer contract details loaded:", contractData);
    } catch (error) {
      console.error("❌ Error loading dealer contract details:", error);
      message.error("Không thể tải thông tin hợp đồng");
      navigate("/dealer-manager/contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSuccess = async (signatureData) => {
    message.success("Ký hợp đồng thành công!");
    setIsSigned(true);
    setShowSignatureModal(false);
    // Refresh contract data
    await fetchContractDetails();
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: "default", text: "Bản nháp", icon: <FileTextOutlined /> },
      PENDING_SIGNATURE: {
        color: "processing",
        text: "Chờ ký",
        icon: <ClockCircleOutlined />,
      },
      SIGNED: {
        color: "success",
        text: "Đã ký",
        icon: <CheckCircleOutlined />,
      },
      ACTIVE: {
        color: "success",
        text: "Đang hoạt động",
        icon: <CheckCircleOutlined />,
      },
      CANCELED: { color: "error", text: "Đã hủy", icon: <ClockCircleOutlined /> },
    };

    const config = statusConfig[status] || {
      color: "default",
      text: status,
      icon: <FileTextOutlined />,
    };

    return (
      <Tag
        color={config.color}
        icon={config.icon}
        style={{ padding: "4px 12px", fontSize: "14px" }}
      >
        {config.text}
      </Tag>
    );
  };

  if (loading || !contract) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  const canSign =
    !isSigned &&
    (contract.status === "PENDING_SIGNATURE" || contract.status === "DRAFT");

  return (
    <div className="dealer-contract-detail-page">
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                <FileTextOutlined /> Chi tiết hợp đồng Dealer:{" "}
                {contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
              </Title>
              {getStatusTag(contract.status)}
            </Space>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/dealer-manager/contracts")}
              >
                Quay lại
              </Button>
              {canSign && (
                <Button
                  type="primary"
                  size="large"
                  icon={<SafetyOutlined />}
                  onClick={() => setShowSignatureModal(true)}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Ký hợp đồng
                </Button>
              )}
              {isSigned && (
                <Button
                  type="default"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  disabled
                  style={{
                    backgroundColor: "#f6ffed",
                    borderColor: "#b7eb8f",
                    color: "#52c41a",
                  }}
                >
                  Đã ký
                </Button>
              )}
            </Space>
          </div>
        }
        bordered={false}
        className="card-with-shadow"
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Alert nếu chưa ký */}
        {canSign && (
          <Alert
            message="Hợp đồng chờ ký số điện tử"
            description="Bạn cần ký xác nhận hợp đồng này bằng chữ ký số điện tử. Nhấn nút 'Ký hợp đồng' bên trên để tiếp tục."
            type="warning"
            showIcon
            icon={<SafetyOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Alert đã ký */}
        {isSigned && (
          <Alert
            message="Hợp đồng đã được ký"
            description={`Hợp đồng đã được ký điện tử vào ${contract.signedAt ? moment(contract.signedAt).format("DD/MM/YYYY HH:mm") : "N/A"}`}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card type="inner" title="Thông tin cơ bản">
              <Descriptions
                bordered
                column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="ID">{contract.id}</Descriptions.Item>
                <Descriptions.Item label="Mã hợp đồng">
                  {contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(contract.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {contract.createdAt
                    ? moment(contract.createdAt).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {contract.updatedAt
                    ? moment(contract.updatedAt).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày ký">
                  {contract.signedAt ? (
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      {moment(contract.signedAt).format("DD/MM/YYYY HH:mm")}
                    </Space>
                  ) : (
                    <Text type="secondary">Chưa ký</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Thông tin liên kết">
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="ID Đơn hàng">
                  {contract.orderId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="ID Khách hàng">
                  {contract.customerId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Dealer ID">
                  {contract.dealerId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="ID Người tạo">
                  {contract.createdByUserId || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {contract.terms && (
            <Col span={24}>
              <Card type="inner" title="Điều khoản hợp đồng">
                <Text style={{ whiteSpace: "pre-wrap" }}>{contract.terms}</Text>
              </Card>
            </Col>
          )}

          {contract.contractLink && (
            <Col span={24}>
              <Card type="inner" title="Tài liệu hợp đồng">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong>Link tài liệu hợp đồng:</Text>
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(contract.contractLink, "_blank")}
                    >
                      Xem tài liệu
                    </Button>
                  </div>
                  <Text type="secondary" ellipsis>
                    {contract.contractLink}
                  </Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </Card>

      {/* Digital Signature Modal */}
      {contract && showSignatureModal && (
        <DealerManagerSignatureModal
          visible={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={handleSignatureSuccess}
          documentType="DealerContract"
          documentId={id}
          signerEmail={
            sessionStorage.getItem("userEmail") || "dealer-manager@example.com"
          }
          documentName={`Dealer Contract ${contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}`}
        />
      )}
    </div>
  );
};

export default DealerContractDetailPage;

