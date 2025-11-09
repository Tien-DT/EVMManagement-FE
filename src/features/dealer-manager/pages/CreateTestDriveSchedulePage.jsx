import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, Car } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const CreateTestDriveSchedulePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [masterTimeSlots, setMasterTimeSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    warehouseId: "",
    vehicleIds: [],
    slotDate: "",
    masterSlotId: "",
    status: "AVAILABLE", // Default: AVAILABLE (unchecked)
  });

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

  // Fetch warehouses
  useEffect(() => {
    if (!dealerId) return;

    const fetchWarehouses = async () => {
      try {
        const response = await axiosInstance.get(
          endpoints.warehouses.getByDealer(dealerId)
        );
        console.log("Warehouses response:", response);
        
        if (response.success) {
          // Handle both array and object with items
          const warehouseList = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.items || []);
          console.log("Warehouse list:", warehouseList);
          setWarehouses(warehouseList);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        showError("Không thể tải danh sách kho");
      }
    };

    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  // Fetch master time slots
  useEffect(() => {
    if (!dealerId) return;

    const fetchMasterTimeSlots = async () => {
      try {
        const response = await axiosInstance.get(
          endpoints.masterTimeSlots.getByDealer(dealerId)
        );
        if (response.success) {
          const slotList = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.items || []);
          const activeSlots = slotList.filter(slot => slot.isActive);
          setMasterTimeSlots(activeSlots);
        }
      } catch (error) {
        console.error("Error fetching master time slots:", error);
        showError("Không thể tải danh sách time slots");
      }
    };

    fetchMasterTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  // Get vehicles from selected warehouse
  useEffect(() => {
    if (!formData.warehouseId) {
      setVehicles([]);
      return;
    }

    // Find selected warehouse
    const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);
    
    if (selectedWarehouse && selectedWarehouse.vehicles) {
      // Filter vehicles with status RESERVED
      const reservedVehicles = selectedWarehouse.vehicles.filter(
        (v) => v.status === "RESERVED"
      );
      console.log("Reserved vehicles:", reservedVehicles);
      setVehicles(reservedVehicles);
    } else {
      setVehicles([]);
    }
  }, [formData.warehouseId, warehouses]);

  const handleWarehouseChange = (e) => {
    setFormData({
      ...formData,
      warehouseId: e.target.value,
      vehicleIds: [], // Reset selected vehicles when warehouse changes
    });
  };

  const handleVehicleToggle = (vehicleId) => {
    setFormData((prev) => ({
      ...prev,
      vehicleIds: prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter((id) => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.warehouseId) {
      showError("Vui lòng chọn kho");
      return;
    }
    if (formData.vehicleIds.length === 0) {
      showError("Vui lòng chọn ít nhất một xe");
      return;
    }
    if (!formData.slotDate) {
      showError("Vui lòng chọn ngày");
      return;
    }
    if (!formData.masterSlotId) {
      showError("Vui lòng chọn time slot");
      return;
    }

    try {
      setLoading(true);
      
      // Format date to ISO string
      const slotDateISO = new Date(formData.slotDate).toISOString();

      const payload = {
        masterSlotId: formData.masterSlotId,
        slotDate: slotDateISO,
        vehicleIds: formData.vehicleIds,
        status: formData.status,
      };

      const response = await axiosInstance.post(
        endpoints.vehicleTimeSlots.bulkAssign,
        payload
      );

      if (response.success) {
        showSuccess("Tạo lịch lái thử thành công!");
        navigate("/dealer-manager/test-drive-schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      showError(error.message || "Không thể tạo lịch lái thử");
    } finally {
      setLoading(false);
    }
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  if (!dealerId) {
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer-manager/test-drive-schedule")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại lịch
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Tạo lịch lái thử
        </h1>
        <p className="text-gray-600 mt-2">
          Thêm xe vào lịch lái thử cho ngày và giờ cụ thể
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Warehouse Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kho <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.warehouseId}
            onChange={handleWarehouseChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn kho --</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.address}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection */}
        {formData.warehouseId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Xe lái thử <span className="text-red-500">*</span>
            </label>
            {vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Không có xe nào sẵn sàng trong kho này (status: RESERVED)
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {vehicles.map((vehicle) => (
                  <label
                    key={vehicle.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.vehicleIds.includes(vehicle.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.vehicleIds.includes(vehicle.id)}
                      onChange={() => handleVehicleToggle(vehicle.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-gray-600" />
                        <span className="font-medium text-sm">{vehicle.vin}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Status: {vehicle.status}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Đã chọn: {formData.vehicleIds.length} xe
            </p>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ngày lái thử <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.slotDate}
            onChange={(e) => setFormData({ ...formData, slotDate: e.target.value })}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Master Time Slot Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time Slot <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.masterSlotId}
            onChange={(e) => setFormData({ ...formData, masterSlotId: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn time slot --</option>
            {masterTimeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.code} ({minutesToTime(slot.startOffsetMinutes)} - 
                {minutesToTime(slot.startOffsetMinutes + slot.durationMinutes)}) - 
                {slot.durationMinutes} phút
              </option>
            ))}
          </select>
        </div>

        {/* Status Checkbox */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.status === "BOOKED"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.checked ? "BOOKED" : "AVAILABLE",
                })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Đánh dấu là đã đặt (BOOKED)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            {formData.status === "BOOKED"
              ? "Slot sẽ được tạo với trạng thái đã đặt"
              : "Slot sẽ được tạo với trạng thái còn trống"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/dealer-manager/test-drive-schedule")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo..." : "Tạo lịch"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTestDriveSchedulePage;
