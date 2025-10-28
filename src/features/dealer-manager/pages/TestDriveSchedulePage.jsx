import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Car,
  Clock,
  Plus,
  X,
  Search,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import masterTimeSlotService from "../services/masterTimeSlotService";

const TestDriveSchedulePage = () => {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [vehicleTimeSlots, setVehicleTimeSlots] = useState({});
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [masterSlots, setMasterSlots] = useState([]);
  const [selectedMasterSlot, setSelectedMasterSlot] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dealerId from userProfile
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        if (response.success && response.data) {
          const userDealerId = response.data.dealerId;
          if (userDealerId) {
            setDealerId(userDealerId);
          } else {
            toast.error("Không tìm thấy dealerId trong profile");
          }
        }
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
        toast.error("Lỗi khi lấy thông tin dealer");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

  // Fetch vehicle time slots for the current month
  const fetchVehicleTimeSlots = async () => {
    if (!dealerId) return;

    try {
      setLoading(true);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      // Use the existing slots-by-date endpoint
      const response = await axiosInstance.get(
        `/v1/VehicleTimeSlots/slots-by-date`,
        {
          params: {
            dealerId: dealerId,
            fromDate: startDate,
            toDate: endDate,
            // Don't include modelId - we want all vehicles
          },
        }
      );

      if (response?.success && response?.data) {
        // The response is already grouped by date (DateSlotGroupDto format)
        console.log("Vehicle time slots response:", response.data);
        const slotsByDate = {};

        response.data.forEach((dateGroup) => {
          const date = dateGroup.date.split("T")[0];
          console.log(`Processing date ${date}:`, dateGroup);

          // Combine all slots from different master slots
          const allSlots = [];

          // Check if the structure has masterSlots instead of slotGroups
          const slotsArray =
            dateGroup.masterSlots || dateGroup.slotGroups || [];

          slotsArray.forEach((slotGroup) => {
            // Each slotGroup contains vehicles
            const vehicles = slotGroup.vehicles || slotGroup.slots || [];
            vehicles.forEach((vehicleSlot) => {
              console.log("Vehicle slot data:", vehicleSlot);
              console.log("Slot status value:", vehicleSlot.status);

              allSlots.push({
                vehicleTimeSlotId: vehicleSlot.vehicleTimeSlotId,
                status: vehicleSlot.status,
                // Map vehicle data correctly from nested structure
                id: vehicleSlot.vehicle?.id,
                vin: vehicleSlot.vehicle?.vin || "No VIN",
                vehicleModelName:
                  vehicleSlot.vehicle?.modelName || "Unknown Model",
                color: vehicleSlot.vehicle?.color || "N/A",
                vehicleStatus: vehicleSlot.vehicle?.status,
                vehiclePurpose: vehicleSlot.vehicle?.purpose,
                // Include master slot info
                masterSlotCode: slotGroup.masterSlotCode || slotGroup.code,
                masterSlotId: slotGroup.masterSlotId || slotGroup.id,
                startTime: slotGroup.startTime,
                endTime: slotGroup.endTime,
              });
            });
          });

          if (allSlots.length > 0) {
            slotsByDate[date] = allSlots;
            console.log(`Added ${allSlots.length} slots for date ${date}`);
          }
        });

        console.log("Final slotsByDate:", slotsByDate);
        setVehicleTimeSlots(slotsByDate);
      }
    } catch (error) {
      console.error("Error fetching vehicle time slots:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  // Fetch master time slots for the dealer
  const fetchMasterSlots = async () => {
    if (!dealerId) return;

    try {
      const response = await masterTimeSlotService.getByDealerId(dealerId, {
        pageSize: 100,
        isActive: true,
      });

      if (response?.success && response?.data) {
        setMasterSlots(response.data.items || []);
      } else if (response?.items) {
        setMasterSlots(response.items || []);
      } else if (Array.isArray(response)) {
        setMasterSlots(response);
      }
    } catch (error) {
      console.error("Error fetching master slots:", error);
      toast.error("Failed to load time slots");
    }
  };

  // Fetch available test drive vehicles with assignment status
  const fetchAvailableVehicles = async (slotDate, masterSlotId) => {
    if (!dealerId) {
      console.log("No dealerId available for fetching vehicles");
      return;
    }

    // If no slot info provided, use the old method for initial load
    if (!slotDate || !masterSlotId) {
      try {
        setLoadingVehicles(true);
        const response = await axiosInstance.get(`/v1/Vehicles/filter`, {
          params: {
            DealerId: dealerId,
            Status: 0, // IN_STOCK
            Purpose: 1, // TEST_DRIVE
            PageSize: 50,
            PageNumber: 1,
          },
        });

        let vehicleList = [];
        if (response?.success && response?.data) {
          vehicleList = response.data.items || [];
        } else if (response?.data) {
          vehicleList = response.data.items || response.data || [];
        } else if (response?.items) {
          vehicleList = response.items || [];
        } else if (Array.isArray(response)) {
          vehicleList = response;
        }

        // Fetch variant details for each vehicle
        const detailedVehicles = await Promise.all(
          vehicleList.map(async (vehicle) => {
            try {
              const variantResponse = await axiosInstance.get(
                `/v1/VehicleVariants/${vehicle.variantId}`
              );
              if (variantResponse?.success && variantResponse?.data) {
                const variant = variantResponse.data;
                return {
                  ...vehicle,
                  vehicleModelName:
                    variant.vehicleModel?.name ||
                    variant.modelName ||
                    "Unknown Model",
                  vehicleVariantName: variant.name || "Unknown Variant",
                  color: variant.color || "N/A",
                  isAlreadyAssigned: false, // Default to not assigned
                };
              }
            } catch (err) {
              console.error(
                `Error fetching variant for vehicle ${vehicle.id}:`,
                err
              );
            }
            return {
              ...vehicle,
              vehicleModelName: "Unknown Model",
              vehicleVariantName: "Unknown Variant",
              color: "N/A",
              isAlreadyAssigned: false,
            };
          })
        );

        setVehicles(detailedVehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setLoadingVehicles(false);
      }
      return;
    }

    // Use new endpoint when slot info is provided
    try {
      setLoadingVehicles(true);
      console.log(
        "Fetching available vehicles for slot:",
        slotDate,
        masterSlotId
      );

      const response = await axiosInstance.get(
        `/v1/VehicleTimeSlots/available-vehicles-for-slot`,
        {
          params: {
            dealerId: dealerId,
            slotDate: slotDate,
            masterSlotId: masterSlotId,
          },
        }
      );

      if (response?.success && response?.data) {
        const vehicleData = response.data;
        console.log("Available vehicles response:", vehicleData);

        // Map the vehicles with their assignment status
        const mappedVehicles = vehicleData.availableVehicles.map((v) => ({
          id: v.id,
          vin: v.vin,
          vehicleModelName: v.modelName,
          vehicleVariantName: v.variantName,
          color: v.color,
          imageUrl: v.imageUrl,
          isAlreadyAssigned: v.isAlreadyAssigned,
        }));

        setVehicles(mappedVehicles);

        // Show info about already assigned vehicles
        if (vehicleData.alreadyAssigned > 0) {
          toast.info(
            `${vehicleData.alreadyAssigned} vehicles are already assigned to this slot`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching available vehicles:", error);
      toast.error("Failed to load available vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (dealerId) {
      fetchVehicleTimeSlots();
      fetchMasterSlots();
    }
  }, [dealerId, currentDate]);

  // Calendar generation functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const formatDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (day, addNewOnly = false) => {
    if (!day) return;

    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setSelectedVehicles([]);
    setSelectedMasterSlot("");
    setSearchQuery("");
    setVehicles([]); // Clear previous vehicles

    // Get existing slots for this date
    const existingSlots = vehicleTimeSlots[dateKey] || [];
    console.log("Existing slots for date:", dateKey, existingSlots);

    // Make sure master slots are loaded
    if (masterSlots.length === 0) {
      console.log("Master slots not loaded, fetching...");
      fetchMasterSlots();
    }

    setShowAssignModal(true);

    // Don't load vehicles immediately - wait for slot selection
  };

  const handleVehicleToggle = (vehicleId) => {
    setSelectedVehicles((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleAssignVehicles = async () => {
    if (!selectedMasterSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (selectedVehicles.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        masterSlotId: selectedMasterSlot,
        slotDate: selectedDate,
        vehicleIds: selectedVehicles,
        status: 0, // AVAILABLE
      };

      const response = await axiosInstance.post(
        "/v1/VehicleTimeSlots/bulk-assign",
        payload
      );

      if (response?.success || response?.data) {
        toast.success(
          `Successfully assigned ${selectedVehicles.length} vehicles`
        );
        setShowAssignModal(false);
        fetchVehicleTimeSlots(); // Refresh calendar
      }
    } catch (error) {
      console.error("Error assigning vehicles:", error);
      toast.error(error.message || "Failed to assign vehicles");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.vin?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleModelName?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleVariantName?.toLowerCase().includes(searchLower) ||
      vehicle.color?.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Test Drive Schedule
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage test drive vehicle assignments by date and time slot
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Calendar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading schedule...</span>
              </div>
            ) : (
              <>
                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-600 p-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => {
                    const dateKey = day ? formatDateKey(day) : null;
                    const slots = dateKey
                      ? vehicleTimeSlots[dateKey] || []
                      : [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const cellDate = day
                      ? new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        )
                      : null;
                    const isPastDate = cellDate && cellDate < today;

                    // Group slots by master slot
                    const slotsByMaster = {};
                    slots.forEach((slot) => {
                      const key = slot.masterSlotId || "unknown";
                      if (!slotsByMaster[key]) {
                        slotsByMaster[key] = {
                          code: slot.masterSlotCode,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                          vehicles: [],
                        };
                      }
                      slotsByMaster[key].vehicles.push(slot);
                    });

                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[120px] p-2 border rounded-lg relative
                          ${day ? "hover:bg-gray-50" : ""}
                          ${isPastDate ? "bg-gray-100" : "bg-white"}
                        `}
                      >
                        {day && (
                          <>
                            <div className="flex items-start justify-between">
                              <div className="font-medium text-sm mb-1">
                                {day}
                              </div>
                              {!isPastDate && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDateClick(day, true);
                                  }}
                                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Add new vehicles"
                                >
                                  <Plus className="h-4 w-4 text-blue-600" />
                                </button>
                              )}
                            </div>

                            <div
                              className="cursor-pointer"
                              onClick={() => handleDateClick(day)}
                            >
                              {Object.keys(slotsByMaster).length > 0 ? (
                                <div className="space-y-1 text-xs">
                                  {Object.values(slotsByMaster)
                                    .slice(0, 2)
                                    .map((slot, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-blue-50 rounded px-1 py-0.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <Clock className="h-3 w-3 text-blue-600" />
                                          <span className="font-medium text-blue-700">
                                            {slot.startTime || "N/A"} -{" "}
                                            {slot.endTime || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex items-center text-gray-600 mt-0.5">
                                          <Car className="h-3 w-3 mr-1" />
                                          <span>
                                            {slot.vehicles.length} vehicles
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  {Object.keys(slotsByMaster).length > 2 && (
                                    <div className="text-center text-gray-500">
                                      +{Object.keys(slotsByMaster).length - 2}{" "}
                                      more...
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-xs mt-4">
                                  No slots
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Manage Vehicles Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setShowAssignModal(false)}
            ></div>

            <div className="relative bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Test Drive Schedule Management
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Date:{" "}
                      {selectedDate &&
                        new Date(selectedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div
                className="p-6 overflow-y-auto"
                style={{ maxHeight: "calc(90vh - 200px)" }}
              >
                {/* Existing Slots Section */}
                {(() => {
                  const existingSlots = vehicleTimeSlots[selectedDate] || [];
                  const slotsByMaster = {};
                  existingSlots.forEach((slot) => {
                    const key = slot.masterSlotId || "unknown";
                    if (!slotsByMaster[key]) {
                      slotsByMaster[key] = {
                        code: slot.masterSlotCode,
                        id: slot.masterSlotId,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        vehicles: [],
                      };
                    }
                    slotsByMaster[key].vehicles.push(slot);
                  });

                  const selectedDateObj = new Date(selectedDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const canAddNew = selectedDateObj >= today;

                  return Object.keys(slotsByMaster).length > 0 ? (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Existing Time Slots
                      </h4>
                      <div className="space-y-4">
                        {Object.values(slotsByMaster).map((slot, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">
                                  {slot.code} ({slot.startTime || formatTime(0)}{" "}
                                  - {slot.endTime || formatTime(0)})
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {slot.vehicles.length} vehicles assigned
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {slot.vehicles.map((vehicle, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="bg-white rounded-lg p-3 border"
                                >
                                  <div className="text-sm font-medium">
                                    {vehicle.vehicleModelName ||
                                      "Unknown Model"}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    VIN: {vehicle.vin || "No VIN"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Color: {vehicle.color || "N/A"}
                                  </div>

                                  <div
                                    className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                                      vehicle.status === 0 ||
                                      vehicle.status === "0" ||
                                      vehicle.status === "AVAILABLE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {vehicle.status === 0 ||
                                    vehicle.status === "0" ||
                                    vehicle.status === "AVAILABLE"
                                      ? "Available"
                                      : "Booked"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Add New Vehicles Section - Only show for present/future dates */}
                {(() => {
                  const selectedDateObj = new Date(selectedDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const canAddNew = selectedDateObj >= today;

                  if (!canAddNew) {
                    return (
                      <div className="border-t pt-6">
                        <div className="text-center text-gray-500 py-8">
                          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm">
                            Cannot add vehicles to past dates
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            You can only view existing schedules for past dates
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="border-t pt-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Add New Vehicles to Schedule
                      </h4>

                      {/* Time Slot Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Time Slot{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedMasterSlot}
                          onChange={(e) => {
                            console.log(
                              "Master slot selected:",
                              e.target.value
                            );
                            setSelectedMasterSlot(e.target.value);
                            // Fetch vehicles with slot-specific availability
                            if (e.target.value && selectedDate) {
                              fetchAvailableVehicles(
                                selectedDate,
                                e.target.value
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Select a time slot --</option>
                          {masterSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                              {slot.code} ({formatTime(slot.startOffsetMinutes)}{" "}
                              -{" "}
                              {formatTime(
                                (slot.startOffsetMinutes || 0) +
                                  (slot.durationMinutes || 0)
                              )}
                              )
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Vehicle Search */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Search vehicles by VIN, model, variant, or color..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Available Vehicles */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700">
                            Available Vehicles ({filteredVehicles.length})
                          </h5>
                          <div className="text-sm text-gray-600">
                            {selectedVehicles.length} selected
                          </div>
                        </div>

                        {loadingVehicles ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Loading vehicles...
                            </span>
                          </div>
                        ) : filteredVehicles.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No vehicles available for test drive
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredVehicles.map((vehicle) => (
                              <div
                                key={vehicle.id}
                                className={`
                                  border rounded-lg p-3 transition-all
                                  ${
                                    vehicle.isAlreadyAssigned
                                      ? "opacity-50 bg-gray-100 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }
                                  ${
                                    selectedVehicles.includes(vehicle.id) &&
                                    !vehicle.isAlreadyAssigned
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                                onClick={() =>
                                  !vehicle.isAlreadyAssigned &&
                                  handleVehicleToggle(vehicle.id)
                                }
                              >
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedVehicles.includes(
                                      vehicle.id
                                    )}
                                    disabled={vehicle.isAlreadyAssigned}
                                    onChange={() => {}}
                                    className={`mt-1 h-4 w-4 border-gray-300 rounded ${
                                      vehicle.isAlreadyAssigned
                                        ? "cursor-not-allowed opacity-50"
                                        : "text-blue-600 focus:ring-blue-500"
                                    }`}
                                  />
                                  <div className="flex-1">
                                    {vehicle.imageUrl ? (
                                      <img
                                        src={vehicle.imageUrl}
                                        alt={
                                          vehicle.vehicleModelName || "Vehicle"
                                        }
                                        className="w-full h-24 object-cover rounded-lg mb-2"
                                      />
                                    ) : (
                                      <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                        <Car className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-sm">
                                          {vehicle.vehicleModelName ||
                                            "Model N/A"}
                                        </div>
                                        {vehicle.isAlreadyAssigned && (
                                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                            Assigned
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {vehicle.vehicleVariantName ||
                                          "Variant N/A"}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        VIN: {vehicle.vin || "N/A"}
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                          Color: {vehicle.color || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignVehicles}
                    disabled={
                      submitting ||
                      selectedVehicles.length === 0 ||
                      !selectedMasterSlot
                    }
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      submitting ||
                      selectedVehicles.length === 0 ||
                      !selectedMasterSlot
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitting
                      ? "Assigning..."
                      : `Assign ${selectedVehicles.length} Vehicles`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDriveSchedulePage;
