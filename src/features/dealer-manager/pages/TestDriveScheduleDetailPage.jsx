import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Car, User, Phone, Mail } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch booking detail
  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingDetail = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.testDriveBookings.getById(bookingId));
        
        console.log("📋 Booking detail:", response);
        
        if (response.success) {
          setBooking(response.data);
        } else {
          showError("Không thể tải chi tiết đặt chỗ");
        }
      } catch (error) {
        console.error("Error fetching booking detail:", error);
        showError("Không thể tải chi tiết đặt chỗ");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, showError]);

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      CONFIRMED: { label: "Đã xác nhận", color: "bg-green-100 text-green-800" },
      PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
      CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      COMPLETED: { label: "Hoàn thành", color: "bg-blue-100 text-blue-800" },
      BOOKED: { label: "Đã đặt", color: "bg-purple-100 text-purple-800" },
    };
    
    const config = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy thông tin đặt chỗ</p>
          <button
            onClick={() => navigate("/dealer-manager/test-drive-schedule")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại lịch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/dealer-manager/test-drive-schedule")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại lịch</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Đặt Chỗ Lái Thử</h1>
          <p className="text-gray-600 mt-1">Thông tin chi tiết về lịch đặt lái thử</p>
        </div>
        <div>
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="text-blue-600" size={24} />
          Thông Tin Khách Hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Họ tên</p>
            <p className="text-lg font-semibold">{booking.customer?.fullName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="text-lg font-semibold">{booking.customer?.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold">{booking.customer?.email || "N/A"}</p>
          </div>
          {booking.customer?.cardId && (
            <div>
              <p className="text-sm text-gray-600">CMND/CCCD</p>
              <p className="text-lg font-semibold">{booking.customer.cardId}</p>
            </div>
          )}
          {booking.customer?.address && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Địa chỉ</p>
              <p className="text-lg font-semibold">{booking.customer.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" size={24} />
          Thông Tin Đặt Lịch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Mã đặt chỗ</p>
            <p className="text-sm font-semibold font-mono">{booking.id?.slice(0, 13).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ngày lái thử</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.slotDate ? formatDate(booking.vehicleTimeSlot.slotDate) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mã slot</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.masterSlot?.code || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời gian</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.masterSlot ? 
                `${minutesToTime(booking.vehicleTimeSlot.masterSlot.startOffsetMinutes)} - ${minutesToTime(booking.vehicleTimeSlot.masterSlot.startOffsetMinutes + booking.vehicleTimeSlot.masterSlot.durationMinutes)}` 
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời lượng</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.masterSlot?.durationMinutes || 0} phút
            </p>
          </div>
          {booking.checkinAt && (
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="text-lg font-semibold">{new Date(booking.checkinAt).toLocaleString("vi-VN")}</p>
            </div>
          )}
          {booking.checkoutAt && (
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="text-lg font-semibold">{new Date(booking.checkoutAt).toLocaleString("vi-VN")}</p>
            </div>
          )}
          {booking.note && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-2">Ghi chú</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-gray-700">{booking.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Car className="text-blue-600" size={24} />
          Thông Tin Xe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Tên xe</p>
            <p className="text-lg font-semibold">{booking.vehicleModelName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Màu sắc</p>
            <p className="text-lg font-semibold">{booking.vehicleColor || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">VIN</p>
            <p className="text-lg font-semibold font-mono text-sm">
              {booking.vehicleTimeSlot?.vehicle?.vin || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái xe</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.vehicle?.status === "IN_STOCK" ? "Có sẵn" : 
               booking.vehicleTimeSlot?.vehicle?.status === "SOLD" ? "Đã bán" : 
               booking.vehicleTimeSlot?.vehicle?.status || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mục đích</p>
            <p className="text-lg font-semibold">
              {booking.vehicleTimeSlot?.vehicle?.purpose === "TEST_DRIVE" ? "Lái thử" : 
               booking.vehicleTimeSlot?.vehicle?.purpose === "SALE" ? "Bán" : 
               booking.vehicleTimeSlot?.vehicle?.purpose || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Dealer Staff Information */}
      {booking.dealerStaff && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Nhân Viên Phụ Trách
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Họ tên</p>
              <p className="text-lg font-semibold">{booking.dealerStaff.fullName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="text-lg font-semibold">{booking.dealerStaff.phone || "N/A"}</p>
            </div>
            {booking.dealerStaff.cardId && (
              <div>
                <p className="text-sm text-gray-600">CMND/CCCD</p>
                <p className="text-lg font-semibold">{booking.dealerStaff.cardId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông Tin Khác</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Ngày tạo</p>
            <p className="text-lg font-semibold">
              {booking.createdDate ? new Date(booking.createdDate).toLocaleString("vi-VN") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
            <p className="text-lg font-semibold">
              {booking.modifiedDate ? new Date(booking.modifiedDate).toLocaleString("vi-VN") : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDriveBookingDetailPage;
