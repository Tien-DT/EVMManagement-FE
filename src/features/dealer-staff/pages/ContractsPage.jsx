// src/features/dealer-staff/pages/ContractsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  message,
  Tag,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../services/contractService";
import moment from "moment";

const ContractsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Cấu hình status với màu sắc
  const statusConfig = {
    DRAFT: {
      color: "default",
      text: "Bản nháp",
    },
    PENDING_SIGNATURE: {
      color: "processing",
      text: "Chờ ký",
    },
    ACTIVE: {
      color: "success",
      text: "Đang hoạt động",
    },
    CANCELED: {
      color: "error",
      text: "Đã hủy",
    },
  };

  useEffect(() => {
    fetchContracts();
  }, [pagination.current, pagination.pageSize]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractService.getAllContracts(
        pagination.current,
        pagination.pageSize
      );
      
      if (response && (response.success || response.data)) {
        setContracts(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount || 0,
        });
      } else {
        setError("Không thể tải danh sách hợp đồng");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setError("Lỗi khi tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await contractService.deleteContract(id);
      if (response && (response.success || response.data)) {
        message.success("Xóa hợp đồng thành công");
        fetchContracts();
      } else {
        message.error("Không thể xóa hợp đồng");
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      message.error("Lỗi khi xóa hợp đồng");
    }
  };

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 130,
      ellipsis: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      width: 160,
      ellipsis: true,
    },
    {
      title: "Điều khoản",
      dataIndex: "terms",
      key: "terms",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
          <Tag color={config.color} style={{ padding: "4px 8px" }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày ký",
      dataIndex: "signedAt",
      key: "signedAt",
      width: 120,
      render: (date) => (
        date ? moment(date).format("DD/MM/YYYY") : "Chưa ký"
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-staff/contracts/${record.id}`)}
            size="small"
            style={{ color: "#1890ff" }}
          >
            Xem
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dealer-staff/contracts/edit/${record.id}`)}
            size="small"
            style={{ color: "#52c41a" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa hợp đồng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && contracts.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Đang tải danh sách hợp đồng...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "#ff4d4f", fontSize: "16px" }}>Lỗi: {error}</p>
          <Button
            type="primary"
            onClick={fetchContracts}
            style={{ marginTop: "16px" }}
          >
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="contracts-page">
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="text-xl font-bold flex items-center">
              <FileTextOutlined style={{ marginRight: "8px" }} />
              Danh sách hợp đồng
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/dealer-staff/contracts/create")}
            >
              Tạo hợp đồng mới
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} hợp đồng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1100 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ContractsPage;