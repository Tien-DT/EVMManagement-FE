import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Car, User, Phone, Mail, MapPin } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveBookingDetailPage = () => {
  const { date, masterSlotId } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slot, setSlot] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Get dealerId
  useEffect(() => {
    const cachedDealerId = localStorage.getItem("dealerId");
    if (cachedDealerId) {
      setDealerId(cachedDealerId);
    }
  }, []);

  // Fetch slot and bookings data
  useEffect(() => {
    if (!dealerId || !date || !masterSlotId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch slot data using slots-by-date API
        const dateObj = new Date(date);
        const fromDate = `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${dateObj.getFullYear()}`;
        
        const slotResponse = await axiosInstance.get(
          endpoints.vehicleTimeSlots.getSlotsByDate,
          {
            params: {
              dealerId,
              fromDate,
              toDate: fromDate,
            },
          }
        );

        if (slotResponse.success && Array.isArray(slotResponse.data)) {
          const dateItem = slotResponse.data.find((item) => item.date === date);
          if (dateItem) {
            const foundSlot = dateItem.masterSlots?.find(
              (ms) => ms.masterSlotId === masterSlotId
            );
            
            if (foundSlot) {
              setSlot({
                ...foundSlot,
                date: dateItem.date,
              });
            }
          }
        }

        // Fetch bookings for this slot and date
        const bookingResponse = await axiosInstance.get(
          endpoints.testDriveBookings.filter,
          {
            params: {
              dealerId,
              masterSlotId,
              bookingDate: date,
            },
          }
        );

        if (bookingResponse.success) {
          const bookingList = Array.isArray(bookingResponse.data)
            ? bookingResponse.data
            : bookingResponse.data?.items || [];
          setBookings(bookingList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status !== 404) {
          showError("Không thể tải dữ liệu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId, date, masterSlotId]);

  // Format time from minutes
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateStr) => {
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
    };
    
    const config = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer-staff/test-drive-bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Quay lại lịch</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Slot Lái Thử</h1>
      </div>

      {/* Slot Info */}
      {slot && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông Tin Slot</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Mã slot</p>
                <p className="font-semibold">{slot.masterSlotCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Ngày</p>
                <p className="font-semibold">{formatDate(slot.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-semibold">
                  {minutesToTime(slot.startOffsetMinutes)} - {minutesToTime(slot.startOffsetMinutes + slot.durationMinutes)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Thời lượng</p>
                <p className="font-semibold">{slot.durationMinutes} phút</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Car className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Xe có sẵn</p>
                <p className="font-semibold">{slot.availableVehicles} / {slot.totalVehicles}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Đã đặt</p>
                <p className="font-semibold">{slot.bookedVehicles} xe</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Danh Sách Đặt Chỗ</h2>
          <button
            onClick={() => navigate(`/dealer-staff/test-drive-bookings/create?date=${date}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo đặt chỗ mới
          </button>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có đặt chỗ nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Xe</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SĐT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm">
                            {booking.vehicle?.variant?.vehicleModel?.name || booking.vehicleName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">{booking.vehicle?.vin || booking.vin || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-600" />
                        <span className="text-sm">{booking.customerFullName || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-600" />
                        <span className="text-sm">{booking.customerPhone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-600" />
                        <span className="text-sm">{booking.customerEmail || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{booking.note || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDriveBookingDetailPage;
