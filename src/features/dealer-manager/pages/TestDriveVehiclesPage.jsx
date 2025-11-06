import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Tag, Space, Spin, message, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTestDriveVehicles } from "../hooks/useTestDriveVehicles";
import { formatDate } from "../../../utils/dateUtils";

const { Search } = Input;

export const TestDriveVehiclesPage = () => {
  const {
    vehicles,
    isLoading,
    updateStatus,
    deleteVehicle,
    isUpdating,
    isDeleting,
  } = useTestDriveVehicles();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.slotName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === "ALL" || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await updateStatus({ vehicleId, status: newStatus });
      messageApi.success("Cập nhật trạng thái thành công");
    } catch (error) {
      messageApi.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await deleteVehicle(vehicleId);
      messageApi.success("Xóa xe khỏi slot thành công");
    } catch (error) {
      messageApi.error("Xóa xe khỏi slot thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <span>{text.substring(0, 8)}...</span>,
    },
    {
      title: "Tên xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
    },
    {
      title: "Slot",
      dataIndex: "slotName",
      key: "slotName",
    },
    {
      title: "Ngày",
      dataIndex: "slotDate",
      key: "slotDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "AVAILABLE" ? "green" : "orange"}>
          {status === "AVAILABLE" ? "Có sẵn" : "Đã đặt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "AVAILABLE" ? (
            <Button
              type="primary"
              onClick={() => handleStatusChange(record.id, "BOOKED")}
              loading={isUpdating}
            >
              Đánh dấu đã đặt
            </Button>
          ) : (
            <Button
              onClick={() => handleStatusChange(record.id, "AVAILABLE")}
              loading={isUpdating}
            >
              Đánh dấu có sẵn
            </Button>
          )}
          <Button
            danger
            onClick={() => handleDelete(record.id)}
            loading={isDeleting}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách xe lái thử</h1>
        <Link to="/dealer-staff/test-drive-vehicles/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm xe vào slot
          </Button>
        </Link>
      </div>

      {/* Filter Section */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Search
          placeholder="Tìm kiếm theo tên xe hoặc slot"
          allowClear
          enterButton={<SearchOutlined />}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(value) => setSearchTerm(value)}
          style={{ flex: 1, minWidth: 250, maxWidth: 400 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ minWidth: 150 }}
        >
          <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
          <Select.Option value="AVAILABLE">Có sẵn</Select.Option>
          <Select.Option value="BOOKED">Đã đặt</Select.Option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredVehicles?.map((vehicle) => ({
            ...vehicle,
            key: vehicle.id,
          }))}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} xe`,
          }}
          bordered
          locale={{
            emptyText: searchTerm || statusFilter !== "ALL" ? "Không tìm thấy xe phù hợp" : "Không có xe nào",
          }}
        />
      )}
    </div>
  );
};
