// src/features/dealer-staff/components/QuotationForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  User,
  FileText,
  Car,
} from "lucide-react";
import { useDealerCustomers } from "../hooks/useDealerCustomers";
import { useDealerVehicles } from "../hooks/useDealerVehicles";

const QuotationForm = ({ onSubmit, mode = "create" }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [dealerId, setDealerId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    code: "",
    customerId: "",
    createdByUserId: "",
    note: "",
    status: "DRAFT",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    quotationDetails: [],
  });

  // Selected vehicles for step 2
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // Get dealerId and userId
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
      // Không set createdByUserId ở đây, sẽ lấy từ userProfile
      console.log("🔍 User ID set:", user.id);
    }

    const cachedDealerId = sessionStorage.getItem("dealerId");
    if (cachedDealerId) {
      console.log("✅ Found cached dealerId:", cachedDealerId);
      setDealerId(cachedDealerId);
    } else {
      console.log("❌ No dealerId found in sessionStorage, fetching from API...");
      // Fetch dealerId if not in sessionStorage
      const fetchDealerId = async () => {
        try {
          const userStr = sessionStorage.getItem("user");
          if (!userStr) {
            console.error("❌ No user found in sessionStorage");
            return;
          }

          const user = JSON.parse(userStr);
          const accountId = user.id;

          if (!accountId) {
            console.error("❌ No accountId found in user");
            return;
          }

          console.log("🔍 Fetching dealerId for accountId:", accountId);

          // Import dealerService
          const { dealerService } = await import(
            "../../dealer-manager/services/dealerService"
          );

          // Fetch user profile to get dealerId
          const userProfile = await dealerService.getUserProfile(accountId);
          console.log("📦 User profile response:", userProfile);

          if (userProfile.success && userProfile.data) {
            // Lấy dealerId từ userProfile
            const fetchedDealerId = userProfile.data.dealerId;
            console.log("✅ DealerId fetched from API:", fetchedDealerId);

            // Lấy id từ userProfile để dùng cho createdByUserId
            const profileId = userProfile.data.id;
            console.log("✅ Profile ID fetched from API:", profileId);
            
            // Set createdByUserId từ id của userProfile
            if (profileId) {
              setFormData((prev) => ({ ...prev, createdByUserId: profileId }));
              console.log("✅ createdByUserId set to profile ID:", profileId);
            } else {
              console.error("❌ No profile ID found in user profile");
            }

            // Save to sessionStorage for future use
            sessionStorage.setItem(
              "userProfile",
              JSON.stringify(userProfile.data)
            );
            
            if (fetchedDealerId) {
              sessionStorage.setItem("dealerId", fetchedDealerId);
              setDealerId(fetchedDealerId);
            } else {
              console.error("❌ No dealerId found in user profile");
            }
          } else {
            console.error("❌ No data found in user profile response");
            console.error("User profile data:", userProfile.data);
          }
        } catch (error) {
          console.error("❌ Error fetching dealerId:", error);
        }
      };

      fetchDealerId();
    }
  }, []);

  // Fetch customers and vehicles
  const { customers, isLoading: loadingCustomers } =
    useDealerCustomers(dealerId);
  const { vehicles, isLoading: loadingVehicles } = useDealerVehicles(dealerId);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleSelect = (vehicle) => {
    const isSelected = selectedVehicles.some((v) => v.id === vehicle.id);

    if (isSelected) {
      // Deselect
      setSelectedVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } else {
      // Select with default values
      setSelectedVehicles((prev) => [
        ...prev,
        {
          ...vehicle,
          quantity: 1,
          discountPercent: 0,
          note: "",
        },
      ]);
    }
  };

  const handleVehicleDetailChange = (vehicleId, field, value) => {
    setSelectedVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, [field]: value } : v))
    );
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.code || !formData.customerId || !formData.validUntil) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedVehicles.length === 0) {
        alert("Vui lòng chọn ít nhất một xe");
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Prepare quotation details
    const quotationDetails = selectedVehicles.map((vehicle) => ({
      vehicleVariantId: vehicle.variantId,
      quantity: 1, // Mỗi xe là 1 chiếc
      unitPrice: 0, // Tạm thời chưa có price
      discountPercent: vehicle.discountPercent || 0,
      note: vehicle.note || "",
    }));

    const finalData = {
      ...formData,
      quotationDetails,
    };

    console.log("Submitting quotation:", finalData);
    await onSubmit(finalData);
  };

  // Step indicator
  const steps = [
    { number: 1, title: "Thông tin cơ bản", icon: FileText },
    { number: 2, title: "Chọn xe", icon: Car },
    { number: 3, title: "Xác nhận", icon: Check },
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <step.icon size={24} />
              </div>
              <span
                className={`mt-2 text-sm ${
                  currentStep >= step.number
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > step.number ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã báo giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã báo giá *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã báo giá"
              />
            </div>

            {/* Khách hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khách hàng *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) =>
                  handleInputChange("customerId", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn khách hàng</option>
                {loadingCustomers ? (
                  <option disabled>Đang tải...</option>
                ) : (
                  customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName || customer.name || "N/A"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ngày hết hạn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn *
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  handleInputChange("validUntil", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú (nếu có)"
              rows="3"
            />
          </div>
        </div>
      )}

      {/* Step 2: Select Vehicles */}
      {currentStep === 2 && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Chọn xe từ kho
          </h2>

          {loadingVehicles ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách xe...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Không có xe nào trong kho</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicles.some(
                  (v) => v.id === vehicle.id
                );
                const selectedVehicle = selectedVehicles.find(
                  (v) => v.id === vehicle.id
                );

                return (
                  <div
                    key={vehicle.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleVehicleSelect(vehicle)}
                          className="mt-1 w-5 h-5"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {vehicle.variant?.vehicleModel?.name || "N/A"}
                          </h3>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Màu sắc:</span>
                              <p className="font-medium">
                                {vehicle.variant?.color || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Ranking:</span>
                              <p className="font-medium">
                                {vehicle.variant?.vehicleModel?.ranking || vehicle.variant?.ranking || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">VIN:</span>
                              <p className="font-medium">
                                {vehicle.vin || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Trạng thái:</span>
                              <p
                                className={`font-medium ${
                                  vehicle.status === "IN_STOCK"
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {vehicle.status || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Detail form when selected */}
                          {isSelected && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-blue-200">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  % Giảm giá
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={selectedVehicle.discountPercent}
                                  onChange={(e) =>
                                    handleVehicleDetailChange(
                                      vehicle.id,
                                      "discountPercent",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Ghi chú
                                </label>
                                <input
                                  type="text"
                                  value={selectedVehicle.note}
                                  onChange={(e) =>
                                    handleVehicleDetailChange(
                                      vehicle.id,
                                      "note",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Ghi chú cho xe này"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected count */}
          {selectedVehicles.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-900 font-medium">
                Đã chọn {selectedVehicles.length} xe
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Xác nhận thông tin
          </h2>

          {/* Basic Info Review */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mã báo giá:</span>
                <p className="font-medium">{formData.code}</p>
              </div>
              <div>
                <span className="text-gray-600">Khách hàng:</span>
                <p className="font-medium">
                  {customers.find((c) => c.id === formData.customerId)
                    ?.fullName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Ngày hết hạn:</span>
                <p className="font-medium">
                  {new Date(formData.validUntil).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Ghi chú:</span>
                <p className="font-medium">{formData.note || "Không có"}</p>
              </div>
            </div>
          </div>

          {/* Vehicles Review */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Danh sách xe ({selectedVehicles.length})
            </h3>
            <div className="space-y-3">
              {selectedVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {index + 1}.{" "}
                        {vehicle.variant?.vehicleModel?.name || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        Màu: {vehicle.variant?.color} | VIN: {vehicle.vin}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        Giảm giá: {vehicle.discountPercent}%
                      </p>
                      {vehicle.note && (
                        <p className="text-gray-600 text-xs mt-1">
                          {vehicle.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái báo giá
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Nháp</option>
              <option value="SENT">Đã gửi</option>
              <option value="ACCEPTED">Đã chấp nhận</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="CONVERTED_TO_ORDER">Đã chuyển thành đơn hàng</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
          <span>{currentStep === 1 ? "Hủy" : "Quay lại"}</span>
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>Tiếp theo</span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Save size={20} />
            <span>Tạo báo giá</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotationForm;