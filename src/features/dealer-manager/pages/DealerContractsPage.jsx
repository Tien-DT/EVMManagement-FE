// src/features/dealer-manager/pages/DealerContractsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Spin,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Title } = Typography;

const DealerContractsPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealerId, setDealerId] = useState(null);

  useEffect(() => {
    // Get dealerId from sessionStorage
    const userProfile = JSON.parse(sessionStorage.getItem("userProfile") || "{}");
    if (userProfile.dealerId) {
      setDealerId(userProfile.dealerId);
    }
  }, []);

  useEffect(() => {
    if (dealerId) {
      fetchContracts();
    }
  }, [dealerId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        endpoints.dealerContracts.getByDealer(dealerId)
      );
      const contractsList = response.data?.items || response.data || response || [];
      setContracts(contractsList);
    } catch (error) {
      console.error("Error fetching dealer contracts:", error);
      message.error("Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: "default", text: "Bản nháp" },
      PENDING_SIGNATURE: { color: "processing", text: "Chờ ký" },
      SIGNED: { color: "success", text: "Đã ký" },
      ACTIVE: { color: "success", text: "Đang hoạt động" },
      CANCELED: { color: "error", text: "Đã hủy" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "code",
      key: "code",
      render: (code, record) => (
        <Space>
          <FileTextOutlined />
          {code || `DC-${record.id?.slice(-8).toUpperCase()}`}
        </Space>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (name) => name || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Ngày ký",
      dataIndex: "signedAt",
      key: "signedAt",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "Chưa ký"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-manager/contracts/${record.id}`)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined /> Hợp đồng Dealer
            </Title>
            <p className="text-gray-600 mt-1">
              Quản lý các hợp đồng giữa Dealer và EVM
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
        />
      </Card>
    </div>
  );
};

export default DealerContractsPage;

