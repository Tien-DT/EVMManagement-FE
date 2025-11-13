import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Search } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const CreateTestDriveBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  
  const [dealerId, setDealerId] = useState(null);
  const [dealerStaffId, setDealerStaffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  
  // Form state
  const [bookingDate, setBookingDate] = useState("");
  const [masterSlots, setMasterSlots] = useState([]);
  const [selectedMasterSlotId, setSelectedMasterSlotId] = useState("");
  
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    address: "",
    dob: "",
    cardId: "",
    gender: "",
  });
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [dobError, setDobError] = useState("");
  
  const [note, setNote] = useState("");

  // Get dealer ID and staff ID
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const cachedDealerId = localStorage.getItem("dealerId");
        const userProfileStr = localStorage.getItem("userProfile");
        
        if (cachedDealerId && userProfileStr) {
          setDealerId(cachedDealerId);
          const userProfile = JSON.parse(userProfileStr);
          setDealerStaffId(userProfile.id);
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
            setDealerStaffId(userProfile.data.id);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Set booking date and auto-select slot from URL params
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const slotNumberParam = searchParams.get("slotNumber");
    
    if (dateParam) {
      setBookingDate(dateParam);
    }
    
    // Auto-select master slot based on slotNumber (1=sớm nhất, 2=sớm thứ 2, etc.)
    if (slotNumberParam && masterSlots.length > 0) {
      const slotNumber = parseInt(slotNumberParam, 10);
      
      // Sort slots by startOffsetMinutes (sớm nhất -> muộn nhất)
      const sortedSlots = [...masterSlots].sort((a, b) => a.startOffsetMinutes - b.startOffsetMinutes);
      
      // Select slot tương ứng với slotNumber (index = slotNumber - 1)
      const targetSlot = sortedSlots[slotNumber - 1];
      
      if (targetSlot) {
        console.log(`🕒 Auto-selecting slot ${slotNumber}:`, targetSlot.code);
        setSelectedMasterSlotId(targetSlot.id);
      }
    }
  }, [searchParams, masterSlots]);

  // Fetch master time slots
  useEffect(() => {
    if (!dealerId) return;

    const fetchMasterSlots = async () => {
      try {
        const response = await axiosInstance.get(
          endpoints.masterTimeSlots.getByDealer(dealerId)
        );
        
        const slots = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];
        
        const activeSlots = slots.filter((slot) => slot.isActive);
        setMasterSlots(activeSlots);
      } catch (error) {
        console.error("Error fetching master slots:", error);
        showError("Không thể tải danh sách khung giờ");
      }
    };

    fetchMasterSlots();
  }, [dealerId, showError]);

  // Fetch warehouses
  useEffect(() => {
    if (!dealerId) return;

    const fetchWarehouses = async () => {
      try {
        const response = await axiosInstance.get(
          endpoints.admin.warehousesByDealer(dealerId)
        );
        
        const warehouseList = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];
        
        setWarehouses(warehouseList);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        showError("Không thể tải danh sách kho");
      }
    };

    fetchWarehouses();
  }, [dealerId, showError]);

  // Fetch vehicles when warehouse selected
  useEffect(() => {
    if (!selectedWarehouseId) {
      setVehicles([]);
      setSelectedVehicleId("");
      return;
    }

    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get(
          "/v1/Warehouses/dealer-warehouse",
          {
            params: {
              warehouseId: selectedWarehouseId,
              purpose: "TEST_DRIVE",
              status: "IN_STOCK",
            },
          }
        );
        
        // Response structure: { items: [{ vehicles: [...] }] }
        let vehicleList = [];
        if (Array.isArray(response.data)) {
          vehicleList = response.data;
        } else if (response.data?.items) {
          // Flatten vehicles from all warehouses
          vehicleList = response.data.items.flatMap(warehouse => warehouse.vehicles || []);
        }
        
        setVehicles(vehicleList);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      }
    };

    fetchVehicles();
    setSelectedVehicleId("");
  }, [selectedWarehouseId]);

  // Search customer by phone
  const handleSearchCustomer = async () => {
    if (!customerPhone.trim()) {
      showError("Vui lòng nhập số điện thoại");
      return;
    }

    setSearchingCustomer(true);
    try {
      const response = await axiosInstance.get(
        endpoints.customers.searchByPhone,
        {
          params: { phone: customerPhone },
        }
      );

      if (response.success && response.data) {
        const customerData = response.data;
        
        console.log("🔍 Raw customer data from API:", customerData);
        
        // Format dob to YYYY-MM-DD for input type="date"
        let formattedDob = "";
        if (customerData.dob) {
          const dobDate = new Date(customerData.dob);
          formattedDob = dobDate.toISOString().split('T')[0]; // "2000-01-15"
        }
        
        // Convert gender to uppercase to match select options
        let formattedGender = "";
        if (customerData.gender) {
          formattedGender = customerData.gender.toUpperCase(); // "male" -> "MALE"
        }
        
        setCustomer({
          fullName: customerData.fullName || "",
          email: customerData.email || "",
          address: customerData.address || "",
          dob: formattedDob,
          cardId: customerData.cardId || "",
          gender: formattedGender,
        });
        
        console.log("✅ Customer state updated:", {
          fullName: customerData.fullName,
          dob: formattedDob,
          gender: formattedGender,
          rawGender: customerData.gender
        });
        
        setIsCreatingNewCustomer(false);
        showSuccess("✅ Tìm thấy thông tin khách hàng");
      } else {
        setIsCreatingNewCustomer(true);
        showError("⚠️ Không tìm thấy khách hàng với số điện thoại này. Vui lòng nhập thông tin khách hàng mới bên dưới.");
        // Clear form for manual input
        setCustomer({
          fullName: "",
          email: "",
          address: "",
          dob: "",
          cardId: "",
          gender: "",
        });
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      setIsCreatingNewCustomer(true);
      showError("⚠️ Không tìm thấy khách hàng với số điện thoại này. Vui lòng nhập thông tin khách hàng mới bên dưới.");
      // Clear form for manual input
      setCustomer({
        fullName: "",
        email: "",
        address: "",
        dob: "",
        cardId: "",
        gender: "",
      });
    } finally {
      setSearchingCustomer(false);
    }
  };

  // Format time from minutes
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Validate age (must be 18+)
  const validateAge = (dob) => {
    if (!dob) {
      setDobError("");
      return true;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setDobError("Khách hàng phải đủ 18 tuổi để đăng ký lái thử");
      showError("Khách hàng phải đủ 18 tuổi để đăng ký lái thử");
      return false;
    }

    setDobError("");
    return true;
  };

  // Validate email uniqueness
  const validateEmail = async (email) => {
    if (!email || !email.trim()) return true;
    
    try {
      const response = await axiosInstance.get(endpoints.customers.getAll, {
        params: { pageSize: 1000 }
      });
      
      const customers = response.data?.items || response.data || [];
      const existingCustomer = customers.find(
        c => c.email && c.email.toLowerCase() === email.trim().toLowerCase() && c.phone !== customerPhone.trim()
      );
      
      if (existingCustomer) {
        showError(`Email ${email} đã được sử dụng bởi khách hàng khác (SĐT: ${existingCustomer.phone})`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating email:", error);
      return true; // Skip validation if API fails
    }
  };

  // Validate cardId uniqueness
  const validateCardId = async (cardId) => {
    if (!cardId || !cardId.trim()) return true;
    
    try {
      const response = await axiosInstance.get(endpoints.customers.getAll, {
        params: { pageSize: 1000 }
      });
      
      const customers = response.data?.items || response.data || [];
      const existingCustomer = customers.find(
        c => c.cardId && c.cardId === cardId.trim() && c.phone !== customerPhone.trim()
      );
      
      if (existingCustomer) {
        showError(`CCCD/CMND ${cardId} đã được sử dụng bởi khách hàng khác (SĐT: ${existingCustomer.phone})`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating cardId:", error);
      return true; // Skip validation if API fails
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingDate || !selectedMasterSlotId || !selectedVehicleId || !customerPhone.trim() || !customer.fullName.trim()) {
      showError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate age again before submit
    if (customer.dob && !validateAge(customer.dob)) {
      return;
    }

    setLoading(true);
    try {
      // Validate email uniqueness
      if (customer.email && customer.email.trim()) {
        const isEmailValid = await validateEmail(customer.email);
        if (!isEmailValid) {
          setLoading(false);
          return;
        }
      }

      // Validate cardId uniqueness
      if (customer.cardId && customer.cardId.trim()) {
        const isCardIdValid = await validateCardId(customer.cardId);
        if (!isCardIdValid) {
          setLoading(false);
          return;
        }
      }

      const payload = {
        bookingDate: new Date(bookingDate).toISOString(),
        masterSlotId: selectedMasterSlotId,
        vehicleId: selectedVehicleId,
        customerPhone: customerPhone.trim(),
        customerFullName: customer.fullName.trim(),
        customerEmail: customer.email?.trim() || "",
        customerAddress: customer.address?.trim() || "",
        customerDob: customer.dob || null,
        customerCardId: customer.cardId?.trim() || "",
        customerGender: customer.gender || null,
        note: note.trim() || "",
        dealerId: dealerId,
        dealerStaffId: dealerStaffId,
      };

      const response = await axiosInstance.post(
        endpoints.testDriveBookings.createByStaff,
        payload
      );

      if (response.success) {
        showSuccess("Tạo đặt chỗ lái thử thành công");
        navigate("/dealer-staff/test-drive-bookings");
      } else {
        showError(response.message || "Không thể tạo đặt chỗ");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      showError(error.response?.data?.message || "Không thể tạo đặt chỗ lái thử");
    } finally {
      setLoading(false);
    }
  };

  if (!dealerId || !dealerStaffId) {
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
          <span>Quay lại</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Tạo Đặt Chỗ Lái Thử</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Booking Date */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày đặt <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Master Slot */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Khung giờ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMasterSlotId}
              onChange={(e) => setSelectedMasterSlotId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn khung giờ --</option>
              {masterSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.slotCode} ({minutesToTime(slot.startOffsetMinutes)} - {minutesToTime(slot.startOffsetMinutes + slot.durationMinutes)})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kho xe <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                setSelectedWarehouseId(e.target.value);
                setSelectedVehicleId("");
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn kho xe --</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.address}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle List */}
          {selectedWarehouseId && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Xe <span className="text-red-500">*</span>
              </label>
              
              {vehicles.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Không có xe lái thử khả dụng trong kho này</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedVehicleId === vehicle.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="vehicle"
                          checked={selectedVehicleId === vehicle.id}
                          onChange={() => setSelectedVehicleId(vehicle.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{vehicle.variant?.vehicleModel?.name || "N/A"}</p>
                          <p className="text-sm text-gray-600 mt-1">VIN: {vehicle.vin || "N/A"}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                              {vehicle.variant?.color || "N/A"}
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              {vehicle.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Phone with Search */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số điện thoại khách hàng <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setIsCreatingNewCustomer(false); // Reset flag when phone changes
                }}
                required
                placeholder="Nhập số điện thoại"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchCustomer}
                disabled={searchingCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Search size={20} />
                {searchingCustomer ? "Đang tìm..." : "Tìm"}
              </button>
            </div>
          </div>

          {/* New Customer Banner */}
          {isCreatingNewCustomer && (
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Tạo mới khách hàng
                  </p>
                  <p className="mt-1 text-sm text-yellow-700">
                    Số điện thoại chưa có trong hệ thống. Vui lòng nhập đầy đủ thông tin để tạo khách hàng mới. Email và CCCD sẽ được kiểm tra trùng lặp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                value={customer.dob}
                onChange={(e) => {
                  const newDob = e.target.value;
                  setCustomer({ ...customer, dob: newDob });
                  validateAge(newDob);
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  dobError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {dobError && (
                <p className="mt-1 text-sm text-red-600">{dobError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CMND/CCCD
              </label>
              <input
                type="text"
                value={customer.cardId}
                onChange={(e) => setCustomer({ ...customer, cardId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={customer.gender}
                onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/dealer-staff/test-drive-bookings")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "Đang lưu..." : "Tạo đặt chỗ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTestDriveBookingPage;
