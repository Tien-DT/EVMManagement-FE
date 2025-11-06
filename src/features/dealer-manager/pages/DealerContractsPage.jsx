// src/features/dealer-manager/pages/DealerContractsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Input,
  Select,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { Title } = Typography;
const { Search } = Input;

const DealerContractsPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealerId, setDealerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      // Ensure we always get an array
      let contractsList = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        contractsList = response.data.items;
      } else if (Array.isArray(response.data)) {
        contractsList = response.data;
      } else if (Array.isArray(response)) {
        contractsList = response;
      }
      setContracts(contractsList);
    } catch (error) {
      console.error("Error fetching dealer contracts:", error);
      message.error("Không thể tải danh sách hợp đồng");
      setContracts([]); // Ensure empty array on error
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

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = 
        contract.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || contract.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

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

        {/* Filter Section */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm theo mã hợp đồng hoặc khách hàng"
            allowClear
            enterButton={<SearchOutlined />}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            style={{ flex: 1, minWidth: 250, maxWidth: 400 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ minWidth: 200 }}
          >
            <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
            <Select.Option value="DRAFT">Bản nháp</Select.Option>
            <Select.Option value="PENDING_SIGNATURE">Chờ ký</Select.Option>
            <Select.Option value="SIGNED">Đã ký</Select.Option>
            <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
            <Select.Option value="CANCELED">Đã hủy</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredContracts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
          locale={{
            emptyText: searchTerm || statusFilter !== "ALL" ? "Không tìm thấy hợp đồng phù hợp" : "Không có hợp đồng nào",
          }}
        />
      </Card>
    </div>
  );
};

export default DealerContractsPage;

