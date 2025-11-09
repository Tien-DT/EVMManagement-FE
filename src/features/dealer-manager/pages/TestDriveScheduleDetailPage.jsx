import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Car, Package } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveScheduleDetailPage = () => {
  const { date, masterSlotId } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotDetail, setSlotDetail] = useState(null);

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

          const { dealerService } = await import("../services/dealerService");
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

  // Fetch slot detail
  useEffect(() => {
    if (!dealerId || !date || !masterSlotId) return;

    const fetchSlotDetail = async () => {
      try {
        setLoading(true);

        // Parse date (format: YYYY-MM-DD)
        const [year, month, day] = date.split("-");
        const dateObj = new Date(year, month - 1, day);
        
        // Format as MM/DD/YYYY for API
        const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${dateObj.getFullYear()}`;
        
        const response = await axiosInstance.get(
          endpoints.vehicleTimeSlots.getSlotsByDate,
          {
            params: {
              dealerId,
              fromDate: formattedDate,
              toDate: formattedDate,
            },
          }
        );

        if (response.success && Array.isArray(response.data)) {
          // Find the date item
          const dateItem = response.data.find((item) => item.date === date);
          
          if (dateItem) {
            // Find the specific masterSlot
            const slot = dateItem.masterSlots?.find(
              (ms) => ms.masterSlotId === masterSlotId
            );
            
            if (slot) {
              setSlotDetail(slot);
            } else {
              showError("Không tìm thấy lịch");
              navigate("/dealer-manager/test-drive-schedule");
            }
          } else {
            showError("Không tìm thấy lịch");
            navigate("/dealer-manager/test-drive-schedule");
          }
        }
      } catch (error) {
        console.error("❌ Error fetching slot detail:", error);
        showError("Không thể tải chi tiết lịch");
      } finally {
        setLoading(false);
      }
    };

    fetchSlotDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId, date, masterSlotId]);

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
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

  if (!slotDetail) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin lịch</p>
          <button
            onClick={() => navigate("/dealer-manager/test-drive-schedule")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer-manager/test-drive-schedule")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Chi Tiết Lịch Lái Thử
        </h1>
      </div>

      {/* Slot Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Thông Tin Slot
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mã Slot
            </label>
            <p className="text-lg text-blue-600 font-bold">
              {slotDetail.masterSlotCode}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ngày
            </label>
            <p className="text-lg text-gray-900">
              {formatDisplayDate(date)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Clock size={16} className="inline mr-1" />
              Thời Gian
            </label>
            <p className="text-lg text-gray-900">
              {minutesToTime(slotDetail.startOffsetMinutes)} - {minutesToTime(slotDetail.startOffsetMinutes + slotDetail.durationMinutes)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Thời Lượng
            </label>
            <p className="text-lg text-gray-900">
              {slotDetail.durationMinutes} phút
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tổng Xe
            </label>
            <p className="text-lg text-gray-900">
              {slotDetail.totalVehicles || 0} xe
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trạng Thái
            </label>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded text-sm font-medium text-green-600 bg-green-50">
                {slotDetail.availableVehicles || 0} trống
              </span>
              <span className="px-3 py-1 rounded text-sm font-medium text-red-600 bg-red-50">
                {slotDetail.bookedVehicles || 0} đã đặt
              </span>
            </div>
          </div>
        </div>

        {slotDetail.isActive !== undefined && (
          <div className="mt-4">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              slotDetail.isActive 
                ? "text-green-600 bg-green-50" 
                : "text-gray-600 bg-gray-50"
            }`}>
              {slotDetail.isActive ? "Đang hoạt động" : "Không hoạt động"}
            </span>
          </div>
        )}
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-600" />
          Danh Sách Xe ({slotDetail.vehicles?.length || 0})
        </h2>

        {slotDetail.vehicles && slotDetail.vehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">VIN</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Tên Xe</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Model</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Màu Sắc</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Mục Đích</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {slotDetail.vehicles.map((vehicle, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-900 font-mono">
                      {vehicle.vehicle?.vin || "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-900">
                      {vehicle.vehicle?.modelName || "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-900">
                      {vehicle.vehicle?.modelName?.split(" ")[0] || "N/A"}
                    </td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{
                        backgroundColor: vehicle.vehicle?.color === "Trắng" ? "#f3f4f6" : 
                                       vehicle.vehicle?.color === "Đen" ? "#1f2937" : 
                                       vehicle.vehicle?.color === "Xanh" ? "#3b82f6" :
                                       "#e5e7eb",
                        color: vehicle.vehicle?.color === "Đen" ? "#fff" : "#000"
                      }}>
                        {vehicle.vehicle?.color || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium text-purple-600 bg-purple-50">
                        {vehicle.vehicle?.purpose || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vehicle.status === "AVAILABLE" 
                          ? "text-green-600 bg-green-50" 
                          : vehicle.status === "BOOKED"
                          ? "text-red-600 bg-red-50"
                          : "text-gray-600 bg-gray-50"
                      }`}>
                        {vehicle.status === "AVAILABLE" ? "Có sẵn" : 
                         vehicle.status === "BOOKED" ? "Đã đặt" : 
                         vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Chưa có xe nào trong slot này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDriveScheduleDetailPage;
