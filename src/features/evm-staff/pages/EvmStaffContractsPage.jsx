// src/features/evm-staff/pages/EvmStaffContractsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  Row,
  Col,
  Typography,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../../dealer-staff/services/contractService";
import moment from "moment";

const EvmStaffContractsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { Text } = Typography;
  const { Search } = Input;
  const { Option } = Select;

  // Cấu hình status với màu sắc và icon đẹp hơn
  const statusConfig = useMemo(
    () => ({
      DRAFT: {
        color: "#6b7280",
        bgColor: "#f3f4f6",
        borderColor: "#d1d5db",
        text: "Bản nháp",
        icon: <ClockCircleOutlined />,
      },
      PENDING_SIGNATURE: {
        color: "#f59e0b",
        bgColor: "#fef3c7",
        borderColor: "#fcd34d",
        text: "Chờ ký",
        icon: <ClockCircleOutlined />,
      },
      ACTIVE: {
        color: "#52c41a",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
        text: "Đã ký",
        icon: <CheckCircleOutlined />,
      },
      CANCELED: {
        color: "#ff4d4f",
        bgColor: "#fff1f0",
        borderColor: "#ffccc7",
        text: "Đã hủy",
        icon: <DeleteOutlined />,
      },
    }),
    []
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả" },
      ...Object.keys(statusConfig).map((key) => ({
        value: key,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: statusConfig[key].color }}>
              {React.cloneElement(statusConfig[key].icon, {
                style: { fontSize: 14 },
              })}
            </span>
            {statusConfig[key].text}
          </span>
        ),
      })),
    ],
    [statusConfig]
  );

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
        let items = [];
        if (Array.isArray(response.data?.items)) {
          items = response.data.items;
        } else if (Array.isArray(response.data?.data)) {
          items = response.data.data;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        }

        const sortedItems = [...items].sort((a, b) => {
          const createdA = a?.createdDate ? new Date(a.createdDate).getTime() : 0;
          const createdB = b?.createdDate ? new Date(b.createdDate).getTime() : 0;
          return createdB - createdA;
        });

        setContracts(sortedItems);
        setPagination((prev) => ({
          ...prev,
          total:
            response.data?.totalItems ||
            response.data?.totalCount ||
            sortedItems.length,
        }));
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

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesStatus =
        statusFilter === "ALL" || contract.status === statusFilter;

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const code = (contract.code || "").toLowerCase();
      const customerName = (contract.customer?.fullName || "").toLowerCase();
      const orderCode = (contract.order?.code || "").toLowerCase();

      const matchesSearch =
        code.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        orderCode.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [contracts, statusFilter, searchTerm]);

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "code",
      key: "code",
      width: 130,
      fixed: "left",
      render: (text) => (
        <span
          style={{
            fontWeight: 600,
            color: "#1890ff",
            fontSize: "13px",
          }}
        >
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Mã đơn hàng",
      key: "orderCode",
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>
          {record.order?.code || record.orderId || "N/A"}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 170,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>
          {record.customer?.fullName || record.customerId || "N/A"}
        </span>
      ),
    },
    {
      title: "Thành tiền",
      key: "finalAmount",
      width: 130,
      align: "right",
      render: (_, record) => (
        <span
          style={{
            fontWeight: 700,
            color: "#52c41a",
            fontSize: "13px",
          }}
        >
          {record.order?.finalAmount
            ? `${record.order.finalAmount.toLocaleString()} ₫`
            : "-"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
          <Tag
            color={config.color}
            style={{
              padding: "4px 8px",
              fontWeight: 500,
              fontSize: "12px",
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày ký",
      dataIndex: "signedAt",
      key: "signedAt",
      width: 110,
      align: "center",
      render: (date) => (
        <span style={{ fontSize: "13px" }}>
          {date ? moment(date).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" style={{ justifyContent: "flex-end" }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/evm-staff/contracts/${record.id}`)}
            size="small"
            title="Xem chi tiết"
            style={{
              color: "#1890ff",
              padding: "4px 8px",
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/evm-staff/contracts/edit/${record.id}`)}
            size="small"
            title="Chỉnh sửa"
            style={{
              color: "#52c41a",
              padding: "4px 8px",
            }}
          />
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
              title="Xóa"
              style={{ padding: "4px 8px" }}
            />
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

  const pageStyles = `
    .contracts-page {
      min-height: 100%;
      padding: 32px 32px 48px;
      background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
    }

    .contracts-hero-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(82, 196, 26, 0.1));
      border-radius: 18px;
      padding: 28px 32px;
      box-shadow: 0 20px 45px rgba(24, 144, 255, 0.12);
      margin-bottom: 28px;
    }

    @media (min-width: 768px) {
      .contracts-hero-card {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .contracts-hero-card__title {
      margin-bottom: 4px !important;
    }

    .contracts-hero-card__subtitle {
      color: #4b5563;
      font-size: 14px;
    }

    .contracts-hero-card__cta {
      border-radius: 999px;
      height: 46px;
      padding: 0 28px;
      font-weight: 600;
      box-shadow: 0 16px 28px rgba(24, 144, 255, 0.25);
    }

    .contracts-card {
      border-radius: 20px !important;
      border: none !important;
      box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
    }

    .contracts-card__toolbar {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    @media (min-width: 768px) {
      .contracts-card__toolbar {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .contracts-card__toolbar-right {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }

    .contracts-card__count {
      font-size: 13px;
      color: #6b7280;
    }

    .contracts-card__search {
      max-width: 280px;
      flex: 1 1 auto;
    }

    .table-row-light {
      background-color: #f9fbff;
    }

    .table-row-dark {
      background-color: #ffffff;
    }

    :global(.contracts-card .ant-card-body) {
      padding: 24px !important;
    }

    :global(.contracts-card .ant-table) {
      border-radius: 14px;
      overflow: hidden;
    }

    :global(.contracts-card .ant-table-thead > tr > th) {
      background-color: #f1f5f9 !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
    }

    :global(.contracts-card .ant-table-tbody > tr > td) {
      border-bottom: 1px solid #eef2f7;
    }

    :global(.contracts-card .ant-table-tbody > tr:hover > td) {
      background: #ecf3ff !important;
    }

    :global(.contracts-card .ant-table-pagination) {
      margin-top: 24px !important;
    }

    :global(.contracts-card__toolbar-right .ant-input-search .ant-input) {
      border-radius: 999px 0 0 999px;
    }

    :global(.contracts-card__toolbar-right .ant-input-search .ant-input-search-button) {
      border-radius: 0 999px 999px 0;
    }

    :global(.contracts-card__toolbar-right .ant-select-selector) {
      border-radius: 999px !important;
      background: #f8fafc !important;
    }

    :global(.contracts-card .ant-select-dropdown) {
      border-radius: 12px;
    }

    :global(.contracts-card .ant-select-item-option-active) {
      background-color: #f5f7ff !important;
    }
  `;

  const { Title } = Typography;

  return (
    <div className="contracts-page">
      <div className="contracts-hero-card">
        <div>
          <Title level={3} className="contracts-hero-card__title">
            Quản lý hợp đồng
          </Title>
          <Text className="contracts-hero-card__subtitle">
            Theo dõi và quản lý tất cả các hợp đồng kinh doanh với khách hàng.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="contracts-hero-card__cta"
          onClick={() => navigate("/evm-staff/contracts/create")}
        >
          Tạo hợp đồng mới
        </Button>
      </div>

      <Card className="contracts-card" bordered={false}>
        <div className="contracts-card__toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Text type="secondary" className="contracts-card__count">
              Hiển thị {filteredContracts.length} / {contracts.length} hợp đồng
            </Text>
          </div>

          <div className="contracts-card__toolbar-right">
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="contracts-card__type-filter"
              style={{ minWidth: "170px" }}
              size="middle"
            >
              {statusFilterOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Search
              allowClear
              placeholder="Tìm kiếm theo mã, đơn hàng hoặc khách hàng"
              className="contracts-card__search"
              onChange={(event) => setSearchTerm(event.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              enterButton
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredContracts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize,
                total: pagination.total,
              });
            },
            showTotal: (total) => (
              <span style={{ fontWeight: 500 }}>
                Tổng <span style={{ color: "#1890ff" }}>{total}</span> hợp
                đồng
              </span>
            ),
            style: { marginTop: "16px" },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ fontSize: "16px", color: "#999" }}>
                  Không có dữ liệu hợp đồng
                </p>
              </div>
            ),
          }}
          size="middle"
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx>{pageStyles}</style>
    </div>
  );
};

export default EvmStaffContractsPage;
