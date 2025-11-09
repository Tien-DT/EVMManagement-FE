// src/features/dealer-staff/components/TestDriveBookingForm.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useTestDriveVehicles } from "../hooks/useTestDriveVehicles";
import { useDealerCustomers } from "../hooks/useDealerCustomers";
import { Calendar, User, Car, FileText, Loader2 } from "lucide-react";

const TestDriveBookingForm = ({ onSubmit, isSubmitting }) => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [userProfileId, setUserProfileId] = useState(null);

  const { availableVehicles, isLoading: isLoadingVehicles } = useTestDriveVehicles();
  const { customers, isLoading: isLoadingCustomers } = useDealerCustomers(dealerId);

  const [formData, setFormData] = useState({
    vehicleTimeslotId: "",
    customerId: "",
    dealerStaffId: "",
    status: "BOOKED",
    note: "",
  });

  // Get dealerId and userProfileId
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get from localStorage first
        const cachedProfile = localStorage.getItem("userProfile");
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          setDealerId(profile.dealerId);
          setUserProfileId(profile.id);
          setFormData((prev) => ({
            ...prev,
            dealerStaffId: profile.id,
          }));
          return;
        }

        // Get from user context
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const userObj = JSON.parse(userStr);
        if (userObj.userProfileId) {
          setUserProfileId(userObj.userProfileId);
          setFormData((prev) => ({
            ...prev,
            dealerStaffId: userObj.userProfileId,
          }));
        }

        if (userObj.dealerId) {
          setDealerId(userObj.dealerId);
        } else {
          // Fetch from API
          const { dealerService } = await import(
            "../../dealer-manager/services/dealerService"
          );
          const profileResponse = await dealerService.getUserProfile(userObj.id);
          if (profileResponse.success && profileResponse.data) {
            const profile = profileResponse.data;
            localStorage.setItem("userProfile", JSON.stringify(profile));
            setDealerId(profile.dealerId);
            setUserProfileId(profile.id);
            setFormData((prev) => ({
              ...prev,
              dealerStaffId: profile.id,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.vehicleTimeslotId) {
      alert("Vui lòng chọn xe và thời gian");
      return;
    }

    if (!formData.customerId) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    if (!formData.dealerStaffId) {
      alert("Không xác định được nhân viên. Vui lòng đăng nhập lại.");
      return;
    }

    onSubmit(formData);
  };

  // Format vehicle timeslot display
  const getVehicleTimeslotDisplay = (vehicle) => {
    if (!vehicle) return "";
    
    const vehicleName = vehicle.vehicleName || vehicle.vehicle?.name || "N/A";
    const slotName = vehicle.slotName || vehicle.masterTimeSlot?.name || "N/A";
    const slotDate = vehicle.slotDate 
      ? new Date(vehicle.slotDate).toLocaleDateString("vi-VN")
      : "N/A";
    
    return `${vehicleName} - ${slotName} - ${slotDate}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Timeslot Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          <Car className="inline-block mr-2" size={18} />
          Chọn xe và thời gian <span className="text-red-500">*</span>
        </label>
        {isLoadingVehicles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Đang tải danh sách xe...</span>
          </div>
        ) : availableVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Không có xe nào khả dụng</p>
          </div>
        ) : (
          <select
            value={formData.vehicleTimeslotId}
            onChange={(e) => handleInputChange("vehicleTimeslotId", e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
            required
          >
            <option value="">-- Chọn xe và thời gian --</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {getVehicleTimeslotDisplay(vehicle)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Customer Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          <User className="inline-block mr-2" size={18} />
          Chọn khách hàng <span className="text-red-500">*</span>
        </label>
        {isLoadingCustomers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Đang tải danh sách khách hàng...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Không có khách hàng nào</p>
          </div>
        ) : (
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
            required
          >
            <option value="">-- Chọn khách hàng --</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName || customer.name} - {customer.phone || ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          <Calendar className="inline-block mr-2" size={18} />
          Trạng thái
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
        >
          <option value="BOOKED">Đã đặt</option>
          <option value="CHECKED_IN">Đã check-in</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELED">Đã hủy</option>
        </select>
      </div>

      {/* Note */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          <FileText className="inline-block mr-2" size={18} />
          Ghi chú
        </label>
        <textarea
          value={formData.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
          placeholder="Nhập ghi chú (nếu có)..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={isSubmitting || !formData.vehicleTimeslotId || !formData.customerId || !formData.dealerStaffId}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span>Tạo đặt chỗ</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TestDriveBookingForm;
