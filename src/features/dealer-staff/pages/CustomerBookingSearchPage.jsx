import React, { useState, useEffect } from "react";
import { Search, Calendar, Clock, Car, User, Phone, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const CustomerBookingSearchPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  const [dealerId, setDealerId] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Get dealerId from localStorage
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          setDealerId(cachedDealerId);
        } else {
          const userStr = localStorage.getItem("user");
          if (!userStr) return;

          const user = JSON.parse(userStr);
          const accountId = user.id;

          const { dealerService } = await import("../../dealer-manager/services/dealerService");
          const userProfile = await dealerService.getUserProfile(accountId);

          if (userProfile.success && userProfile.data?.dealerId) {
            const fetchedDealerId = userProfile.data.dealerId;
            localStorage.setItem("userProfile", JSON.stringify(userProfile.data));
            localStorage.setItem("dealerId", fetchedDealerId);
            setDealerId(fetchedDealerId);
          }
        }
      } catch (error) {
        console.error("Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, []);

  // Fetch all bookings on mount
  useEffect(() => {
    if (dealerId) {
      fetchAllBookings();
    }
  }, [dealerId, pageNumber, selectedStatus]);

  // Fetch all bookings
  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const params = {
        dealerId: dealerId,
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
      
      // Add status filter if selected
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await axiosInstance.get(endpoints.testDriveBookings.filter, {
        params: params,
      });

      console.log("📋 All bookings response:", response);

      if (response.success) {
        const data = response.data?.items || response.data || [];
        const total = response.data?.totalPages || 1;
        setBookings(Array.isArray(data) ? data : []);
        setTotalPages(total);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Search bookings by phone
  const handleSearch = async () => {
    if (!customerPhone.trim() && !selectedStatus) {
      // If both empty, load all bookings
      setSearched(false);
      setPageNumber(1);
      fetchAllBookings();
      return;
    }

    if (!dealerId) {
      showError("Không tìm thấy thông tin dealer");
      return;
    }

    setLoading(true);
    setSearched(true);
    setPageNumber(1);
    try {
      const params = {
        dealerId: dealerId,
        pageNumber: 1,
        pageSize: 100,
      };
      
      // Add phone if entered
      if (customerPhone.trim()) {
        params.customerPhone = customerPhone.trim();
      }
      
      // Add status if selected
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await axiosInstance.get(endpoints.testDriveBookings.filter, {
        params: params,
      });

      console.log("📋 Search response:", response);

      if (response.success) {
        const data = response.data?.items || response.data || [];
        setBookings(Array.isArray(data) ? data : []);
        setTotalPages(1); // Disable pagination when searching
      } else {
        showError("Không thể tìm kiếm lịch đặt");
        setBookings([]);
      }
    } catch (error) {
      console.error("Error searching bookings:", error);
      showError("Lỗi khi tìm kiếm lịch đặt");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset search
  const handleReset = () => {
    setCustomerPhone("");
    setSelectedStatus("");
    setSearched(false);
    setPageNumber(1);
    fetchAllBookings();
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

  // Format time from minutes
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      BOOKED: { label: "Đã đặt", color: "bg-blue-100 text-blue-800" },
      CHECKED_IN: { label: "Đã check-in", color: "bg-yellow-100 text-yellow-800" },
      COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      CANCELED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      PENDING: { label: "Chờ xác nhận", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tra Cứu Lịch Đặt Lái Thử</h1>
        <p className="text-gray-600 mt-2">Tìm kiếm lịch đặt lái thử theo số điện thoại khách hàng</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="inline-block mr-2" size={16} />
              Số điện thoại khách hàng
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="BOOKED">Đã đặt</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELED">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={loading || !dealerId}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <Search size={20} />
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
            {(customerPhone.trim() || selectedStatus) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 font-semibold transition-colors"
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          <strong>Gợi ý:</strong> Để trống cả 2 ô để xem tất cả lịch đặt, hoặc chọn bộ lọc để tìm kiếm
        </p>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy lịch đặt</h3>
          <p className="text-gray-500">Không có lịch đặt lái thử nào với số điện thoại này</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {searched 
                ? `Tìm thấy ${bookings.length} lịch đặt` 
                : `Hiển thị ${bookings.length} lịch đặt`}
            </h2>
            {!searched && totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Trang {pageNumber} / {totalPages}
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dealer-staff/test-drive-bookings/${booking.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Mã: {booking.id?.slice(0, 13).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.customer?.fullName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.status)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dealer-staff/test-drive-bookings/${booking.id}`);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      <strong>Ngày:</strong>{" "}
                      {booking.vehicleTimeSlot?.slotDate
                        ? formatDate(booking.vehicleTimeSlot.slotDate)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      <strong>Giờ:</strong>{" "}
                      {booking.vehicleTimeSlot?.masterSlot
                        ? `${minutesToTime(
                            booking.vehicleTimeSlot.masterSlot.startOffsetMinutes
                          )} - ${minutesToTime(
                            booking.vehicleTimeSlot.masterSlot.startOffsetMinutes +
                              booking.vehicleTimeSlot.masterSlot.durationMinutes
                          )}`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car size={16} className="text-gray-400" />
                    <span>
                      <strong>Xe:</strong> {booking.vehicleModelName || "N/A"}
                    </span>
                  </div>

                  {booking.note && (
                    <div className="col-span-3 mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-gray-700">
                      <strong>Ghi chú:</strong> {booking.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!searched && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 font-medium transition-colors"
                >
                  Trang trước
                </button>
                <span className="text-sm text-gray-600">
                  Trang {pageNumber} / {totalPages}
                </span>
                <button
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                  disabled={pageNumber === totalPages || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 font-medium transition-colors"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingSearchPage;
