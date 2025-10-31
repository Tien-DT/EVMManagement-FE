import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Space, message, Tooltip, Card } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useAuth } from "../../../hooks/useAuth";

const TransportPage = () => {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTransports();
  }, [pagination.current, pagination.pageSize]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      // Get dealer ID from user profile
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      const dealerId = userProfile?.dealerId;

      if (!dealerId) {
        message.error("Không tìm thấy thông tin dealer");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(endpoints.transports.getByDealer(dealerId), {
        params: {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        },
      });

      if (response.data?.items) {
        setTransports(response.data.items);
        setPagination((prev) => ({
          ...prev,
          total: response.data.totalCount,
        }));
      }
    } catch (error) {
      message.error("Không thể tải danh sách vận chuyển");
      console.error("Error fetching transports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const getStatusTag = (status) => {
    // Normalize status to uppercase string for comparison
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
    
    const statusMap = {
      // Number format
      0: { text: "Chờ xử lý", color: "orange" },
      1: { text: "Đang vận chuyển", color: "blue" },
      2: { text: "Đã giao hàng", color: "cyan" },
      3: { text: "Hoàn thành", color: "green" },
      4: { text: "Đã hủy", color: "red" },
      // String format
      'PENDING': { text: "Chờ xử lý", color: "orange" },
      'IN_TRANSIT': { text: "Đang vận chuyển", color: "blue" },
      'DELIVERED': { text: "Đã giao hàng", color: "cyan" },
      'COMPLETED': { text: "Hoàn thành", color: "green" },
      'CANCELED': { text: "Đã hủy", color: "red" },
    };

    const statusInfo = statusMap[normalizedStatus] || { text: "Không xác định", color: "default" };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "providerName",
      key: "providerName",
      render: (text) => text || "N/A",
    },
    {
      title: "Điểm lấy hàng",
      dataIndex: "pickupLocation",
      key: "pickupLocation",
      render: (text) => text || "N/A",
    },
    {
      title: "Điểm giao hàng",
      dataIndex: "dropoffLocation",
      key: "dropoffLocation",
      render: (text) => text || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thời gian lấy hàng",
      dataIndex: "scheduledPickupAt",
      key: "scheduledPickupAt",
      render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : "N/A"),
    },
    {
      title: "Số đơn hàng",
      key: "orderCount",
      render: (_, record) => {
        const uniqueOrders = new Set(
          record.transportDetails?.filter(td => td.orderId).map(td => td.orderId)
        );
        return uniqueOrders.size;
      },
    },
    {
      title: "Số xe",
      key: "vehicleCount",
      render: (_, record) => record.transportDetails?.length || 0,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => message.info("Chức năng xem chi tiết đang phát triển")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: "600" }}>Theo dõi vận chuyển</span>
            <span style={{ fontSize: "14px", color: "#666" }}>
              Chỉ xem - Liên hệ EVM Staff để tạo vận chuyển mới
            </span>
          </div>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={transports}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} vận chuyển`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default TransportPage;

