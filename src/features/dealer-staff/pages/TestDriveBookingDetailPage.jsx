import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Car, User, Phone, Mail } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Check if current time is within slot time (Vietnam timezone UTC+7)
  const isWithinSlotTime = () => {
    if (!booking?.vehicleTimeSlot?.slotDate || !booking?.vehicleTimeSlot?.masterSlot) {
      return false;
    }

    try {
      const slotDateStr = booking.vehicleTimeSlot.slotDate.split('T')[0]; // "2025-11-14"
      const startMinutes = booking.vehicleTimeSlot.masterSlot.startOffsetMinutes;
      const durationMinutes = booking.vehicleTimeSlot.masterSlot.durationMinutes;

      // Create slot start and end time in Vietnam timezone
      const slotStartTime = new Date(`${slotDateStr}T00:00:00+07:00`);
      slotStartTime.setMinutes(slotStartTime.getMinutes() + startMinutes);

      const slotEndTime = new Date(slotStartTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + durationMinutes);

      // Get current time in Vietnam timezone
      const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

      console.log("⏰ Time check:", {
        nowVN: nowVN.toISOString(),
        slotStart: slotStartTime.toISOString(),
        slotEnd: slotEndTime.toISOString(),
        isWithin: nowVN >= slotStartTime && nowVN <= slotEndTime
      });

      return nowVN >= slotStartTime && nowVN <= slotEndTime;
    } catch (error) {
      console.error("Error checking slot time:", error);
      return false;
    }
  };

  // Check if can check in
  const canCheckIn = () => {
    return isWithinSlotTime() && !booking?.checkinAt;
  };

  // Check if can check out
  const canCheckOut = () => {
    if (!isWithinSlotTime() || !booking?.checkinAt || booking?.checkoutAt) {
      return false;
    }

    // Validate: Must be at least 1 minute after check-in
    const checkinTime = new Date(booking.checkinAt);
    const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const timeDiffMinutes = (nowVN - checkinTime) / 1000 / 60;

    console.log("⏰ Check-out validation:", {
      checkinTime: checkinTime.toISOString(),
      nowVN: nowVN.toISOString(),
      diffMinutes: timeDiffMinutes.toFixed(2),
      canCheckOut: timeDiffMinutes >= 1
    });

    return timeDiffMinutes >= 1;
  };

  // Handle Check In
  const handleCheckIn = async () => {
    if (!canCheckIn()) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.put(
        endpoints.testDriveBookings.update(bookingId),
        {
          checkinAt: new Date().toISOString(),
          checkoutAt: booking.checkoutAt || null,
        }
      );

      if (response.success) {
        showSuccess("Check-in thành công");
        setBooking(response.data);
      } else {
        showError("Không thể check-in");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      showError("Lỗi khi check-in");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    if (!canCheckOut()) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.put(
        endpoints.testDriveBookings.update(bookingId),
        {
          checkinAt: booking.checkinAt,
          checkoutAt: new Date().toISOString(),
        }
      );

      if (response.success) {
        showSuccess("Check-out thành công");
        setBooking(response.data);
      } else {
        showError("Không thể check-out");
      }
    } catch (error) {
      console.error("Error checking out:", error);
      showError("Lỗi khi check-out");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt chỗ này?")) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.patch(
        `${endpoints.testDriveBookings.updateStatus(bookingId)}?status=CANCELED`
      );

      if (response.success) {
        showSuccess("Đã hủy đặt chỗ");
        navigate("/dealer-staff/test-drive-bookings");
      } else {
        showError("Không thể hủy đặt chỗ");
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      showError("Lỗi khi hủy đặt chỗ");
    } finally {
      setActionLoading(false);
    }
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
            onClick={() => navigate("/dealer-staff/test-drive-bookings")}
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
            onClick={() => navigate("/dealer-staff/test-drive-bookings")}
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

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn() || actionLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              canCheckIn() && !actionLoading
                ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={!isWithinSlotTime() ? "Chỉ có thể check-in trong khung giờ đặt lịch" : booking?.checkinAt ? "Đã check-in" : "Check-in"}
          >
            {actionLoading ? "Đang xử lý..." : booking?.checkinAt ? "✓ Đã Check-in" : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!canCheckOut() || actionLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              canCheckOut() && !actionLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={
              booking?.checkoutAt ? "Đã check-out" :
              !booking?.checkinAt ? "Cần check-in trước" : 
              !isWithinSlotTime() ? "Chỉ có thể check-out trong khung giờ đặt lịch" : 
              booking?.checkinAt && (new Date() - new Date(booking.checkinAt)) / 1000 / 60 < 1 ? "Phải chờ ít nhất 1 phút sau check-in" :
              "Check-out"
            }
          >
            {actionLoading ? "Đang xử lý..." : booking?.checkoutAt ? "✓ Đã Check-out" : "Check Out"}
          </button>

          <button
            onClick={handleCancel}
            disabled={actionLoading || booking?.checkoutAt}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              !actionLoading && !booking?.checkoutAt
                ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={booking?.checkoutAt ? "Không thể hủy sau khi check-out" : "Hủy đặt chỗ"}
          >
            {actionLoading ? "Đang xử lý..." : "Hủy Đặt Chỗ"}
          </button>
        </div>

        {/* Time Info */}
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm text-gray-700">
            <strong>Lưu ý:</strong> 
          </p>
          <ul className="text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
            <li>Nút Check In và Check Out chỉ có thể sử dụng trong khung giờ đặt lịch ({booking?.vehicleTimeSlot?.masterSlot ? `${minutesToTime(booking.vehicleTimeSlot.masterSlot.startOffsetMinutes)} - ${minutesToTime(booking.vehicleTimeSlot.masterSlot.startOffsetMinutes + booking.vehicleTimeSlot.masterSlot.durationMinutes)}` : "N/A"})</li>
            <li>Phải chờ ít nhất 1 phút sau khi Check In mới được Check Out</li>
          </ul>
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
