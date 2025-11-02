// src/features/dealer-staff/pages/CreateTestDriveBookingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  message,
  Spin,
  Row,
  Col,
  DatePicker,
  Typography,
  Space,
  Alert,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CalendarOutlined,
  CarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { testDriveService } from "../services/testDriveService";
import { useDealerCustomers } from "../hooks/useDealerCustomers";
import { useDealerVehicles } from "../hooks/useDealerVehicles";
import { useVehicleTimeSlots } from "../hooks/useVehicleTimeSlots";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const CreateTestDriveBookingPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dealerId, setDealerId] = useState(null);
  const [dealerStaffId, setDealerStaffId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch dealerId from userProfile API
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.log("No user.id found");
        setLoadingProfile(false);
        return;
      }

      // Check cached userProfile first
      const storedUserProfileStr = localStorage.getItem("userProfile");
      if (storedUserProfileStr) {
        try {
          const storedUserProfile = JSON.parse(storedUserProfileStr);
          if (storedUserProfile.dealerId) {
            console.log("Using cached dealerId:", storedUserProfile.dealerId);
            setDealerId(storedUserProfile.dealerId);
            setDealerStaffId(storedUserProfile.id || user.id);
            setLoadingProfile(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing cached userProfile:", error);
        }
      }

      try {
        console.log("Fetching user profile for user.id:", user.id);
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        console.log("User profile response:", response);

        if (response.success && response.data) {
          const userDealerId = response.data.dealerId;
          console.log("Found dealerId from profile:", userDealerId);

          if (userDealerId) {
            setDealerId(userDealerId);
            setDealerStaffId(response.data.id || user.id);
            // Cache the profile
            localStorage.setItem("userProfile", JSON.stringify(response.data));
          } else {
            console.error("No dealerId in profile, response.data:", response.data);
          }
        } else {
          console.error("Profile API unsuccessful:", response);
        }
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

  const { customers, isLoading: loadingCustomers } = useDealerCustomers(dealerId);
  const { vehicles, isLoading: loadingVehicles } = useDealerVehicles(dealerId);
  const { fetchAvailableSlots, fetchActiveMasterTimeSlots } =
    useVehicleTimeSlots(dealerId);

  // Load available slots when vehicle and date are selected
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedVehicleId || !selectedDate || !dealerId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = moment(selectedDate).format("YYYY-MM-DD");
        const slots = await fetchAvailableSlots({
          vehicleId: selectedVehicleId,
          slotDate: dateStr,
        });

        console.log("Available slots:", slots);
        setAvailableSlots(slots || []);
      } catch (error) {
        console.error("Error loading available slots:", error);
        message.error("Không thể tải danh sách lịch trống");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedVehicleId, selectedDate, dealerId, fetchAvailableSlots]);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setSelectedSlot(null);
    form.setFieldsValue({ vehicleTimeSlotId: undefined });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    form.setFieldsValue({ vehicleTimeSlotId: undefined });
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    form.setFieldsValue({ vehicleTimeSlotId: slot.id });
  };

  const slotColumns = [
    {
      title: "Mã slot",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_, record) => {
        const masterSlot = record.masterTimeSlot;
        if (masterSlot) {
          const startMinutes = masterSlot.startOffsetMinutes || 0;
          const durationMinutes = masterSlot.durationMinutes || 60;
          const hours = Math.floor(startMinutes / 60);
          const minutes = startMinutes % 60;
          const endHours = Math.floor((startMinutes + durationMinutes) / 60);
          const endMinutes = (startMinutes + durationMinutes) % 60;
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )} - ${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
            2,
            "0"
          )}`;
        }
        return "N/A";
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <span
          style={{
            color: record.isAvailable ? "#52c41a" : "#ff4d4f",
            fontWeight: 500,
          }}
        >
          {record.isAvailable ? "Có sẵn" : "Đã đặt"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type={selectedSlot?.id === record.id ? "primary" : "default"}
          disabled={!record.isAvailable}
          onClick={() => handleSlotSelect(record)}
        >
          {selectedSlot?.id === record.id ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

  const onFinish = async (values) => {
    if (!selectedSlot) {
      message.error("Vui lòng chọn lịch trống");
      return;
    }

    if (!dealerStaffId) {
      message.error("Không tìm thấy thông tin nhân viên");
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        vehicleTimeSlotId: selectedSlot.id,
        customerId: values.customerId,
        dealerStaffId: dealerStaffId,
        status: "BOOKED",
        note: values.note || "",
      };

      console.log("Creating test drive booking:", bookingData);

      const response = await testDriveService.createTestDriveBooking(bookingData);

      if (response.success || response.data) {
        message.success("Tạo đặt lịch lái thử thành công!");
        navigate("/dealer-staff/test-drives");
      } else {
        message.error(response.message || "Không thể tạo đặt lịch");
      }
    } catch (error) {
      console.error("Error creating test drive booking:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi tạo đặt lịch lái thử"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
        </div>
      </Card>
    );
  }

  if (!dealerId) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Typography.Text type="danger">
            Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại.
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CarOutlined style={{ marginRight: "8px", fontSize: "20px" }} />
            <span className="text-xl font-bold">Tạo đặt lịch lái thử</span>
          </div>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer-staff/test-drives")}
          >
            Quay lại
          </Button>
        }
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message="Quy trình đặt lịch"
          description="Chọn khách hàng, xe và ngày, sau đó chọn một lịch trống từ danh sách để hoàn tất đặt lịch."
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{}}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn khách hàng",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  optionFilterProp="children"
                  loading={loadingCustomers}
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {`${customer.fullName || customer.name} - ${
                        customer.phone || "N/A"
                      }`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="Xe"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn xe",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn xe"
                  showSearch
                  optionFilterProp="children"
                  loading={loadingVehicles}
                  onChange={handleVehicleChange}
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                >
                  {vehicles.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {`${vehicle.code || vehicle.id} - ${
                        vehicle.vehicleVariant?.vehicleModel?.name || "N/A"
                      }`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="slotDate"
                label="Ngày"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabledDate={(current) => current && current < moment().startOf("day")}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedVehicleId && selectedDate && (
            <Form.Item
              name="vehicleTimeSlotId"
              label="Lịch trống"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn lịch trống",
                },
              ]}
            >
              <Card size="small" style={{ marginTop: 8 }}>
                {loadingSlots ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin />
                    <div style={{ marginTop: 8 }}>Đang tải lịch trống...</div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <Alert
                    message="Không có lịch trống"
                    description="Vui lòng chọn ngày hoặc xe khác"
                    type="warning"
                  />
                ) : (
                  <Table
                    columns={slotColumns}
                    dataSource={availableSlots}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            </Form.Item>
          )}

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
              >
                Tạo đặt lịch
              </Button>
              <Button
                onClick={() => navigate("/dealer-staff/test-drives")}
                size="large"
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTestDriveBookingPage;

