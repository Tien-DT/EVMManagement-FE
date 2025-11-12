import React, { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveBookingsPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);

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

          const { dealerService} = await import("../../dealer-manager/services/dealerService");
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

  // Generate weeks for selected year
  const weeksInYear = useMemo(() => {
    const weeks = [];
    const startDate = new Date(selectedYear, 0, 1);
    
    const firstMonday = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    firstMonday.setDate(startDate.getDate() + daysToMonday);

    let currentWeekStart = new Date(firstMonday);
    
    while (currentWeekStart.getFullYear() <= selectedYear) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      if (weekEnd.getFullYear() > selectedYear) break;
      
      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(weekEnd),
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }, [selectedYear]);

  // Auto-select current week on mount
  useEffect(() => {
    if (selectedWeekIndex !== null || weeksInYear.length === 0) return;

    const today = new Date();
    const currentWeekIndex = weeksInYear.findIndex((week) => {
      return today >= week.start && today <= week.end;
    });

    setSelectedWeekIndex(currentWeekIndex >= 0 ? currentWeekIndex : 0);
  }, [weeksInYear, selectedWeekIndex]);

  // Get dates for selected week - return both Date objects and string keys
  const weekDates = useMemo(() => {
    if (!weeksInYear[selectedWeekIndex]) return [];
    
    const { start } = weeksInYear[selectedWeekIndex];
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      
      dates.push({
        dateObj: date,
        dateStr: dateStr,
      });
    }
    
    return dates;
  }, [weeksInYear, selectedWeekIndex]);

  // Fetch schedule data for selected week
  useEffect(() => {
    if (!dealerId || weekDates.length === 0 || selectedWeekIndex === null) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        
        const fromDate = `${String(weekDates[0].dateObj.getMonth() + 1).padStart(2, "0")}/${String(weekDates[0].dateObj.getDate()).padStart(2, "0")}/${weekDates[0].dateObj.getFullYear()}`;
        const toDate = `${String(weekDates[6].dateObj.getMonth() + 1).padStart(2, "0")}/${String(weekDates[6].dateObj.getDate()).padStart(2, "0")}/${weekDates[6].dateObj.getFullYear()}`;
        
        const response = await axiosInstance.get(
          endpoints.vehicleTimeSlots.getSlotsByDate,
          {
            params: {
              dealerId,
              fromDate,
              toDate,
            },
          }
        );

        if (response.success) {
          setScheduleData(response.data || []);
        }
      } catch (error) {
        console.error("❌ Error fetching schedule:", error);
        if (error.response?.status === 404) {
          setScheduleData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId, selectedYear, selectedWeekIndex]);

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Format date to YYYY-MM-DD
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Process schedule data
  const processedSchedule = useMemo(() => {
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) return {};

    const result = {};

    weekDates.forEach((dateItem) => {
      result[dateItem.dateStr] = {};
    });

    scheduleData.forEach((dateItem) => {
      const dateKey = dateItem.date;
      
      if (!result[dateKey]) return;
      
      dateItem.masterSlots?.forEach((masterSlot) => {
        result[dateKey][masterSlot.masterSlotId] = {
          masterSlotId: masterSlot.masterSlotId,
          date: dateItem.date,
          code: masterSlot.masterSlotCode,
          startOffsetMinutes: masterSlot.startOffsetMinutes,
          durationMinutes: masterSlot.durationMinutes,
          availableVehicles: masterSlot.availableVehicles || 0,
          bookedVehicles: masterSlot.bookedVehicles || 0,
          totalVehicles: masterSlot.totalVehicles || 0,
        };
      });
    });

    Object.keys(result).forEach((dateKey) => {
      Object.keys(result[dateKey]).forEach((masterSlotId) => {
        const slot = result[dateKey][masterSlotId];
        const hasBooked = slot.bookedVehicles > 0;
        const hasAvailable = slot.availableVehicles > 0;
        
        if (hasBooked && hasAvailable) {
          slot.displayStatus = `${slot.availableVehicles} trống / ${slot.bookedVehicles} đã đặt`;
          slot.statusColor = "text-orange-600 bg-orange-50";
        } else if (hasBooked) {
          slot.displayStatus = "đã đặt hết";
          slot.statusColor = "text-red-600 bg-red-50";
        } else if (hasAvailable) {
          slot.displayStatus = "còn trống";
          slot.statusColor = "text-green-600 bg-green-50";
        } else {
          slot.displayStatus = "chưa có xe";
          slot.statusColor = "text-gray-600 bg-gray-50";
        }
      });
    });

    return result;
  }, [scheduleData, weekDates]);

  // Get slots for a specific date
  const getSlotsForDate = (dateStr) => {
    const slotsForDate = processedSchedule[dateStr] || {};
    
    const sortedSlots = Object.values(slotsForDate).sort(
      (a, b) => a.startOffsetMinutes - b.startOffsetMinutes
    );
    
    return sortedSlots.slice(0, 4);
  };

  // Format date for display (dd/MM)
  const formatDate = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  // Format week range for dropdown
  const formatWeekRange = (week) => {
    return `${formatDate(week.start)} To ${formatDate(week.end)}`;
  };

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Đặt Chỗ Lái Thử
          </h1>
          <p className="text-gray-600 mt-2">
            Xem lịch và tạo đặt chỗ lái thử
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4 items-center">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              YEAR
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedWeekIndex(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 1 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Week Selection */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WEEK
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1))}
                disabled={selectedWeekIndex === 0 || selectedWeekIndex === null}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <select
                value={selectedWeekIndex === null ? "" : selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {weeksInYear.map((week, index) => (
                  <option key={index} value={index}>
                    {formatWeekRange(week)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() =>
                  setSelectedWeekIndex(
                    Math.min(weeksInYear.length - 1, selectedWeekIndex + 1)
                  )
                }
                disabled={selectedWeekIndex === weeksInYear.length - 1 || selectedWeekIndex === null}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 p-3 w-24 text-left text-sm font-semibold">
                    
                  </th>
                  {weekDates.map((dateItem, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 bg-blue-500 text-white p-3 text-center"
                    >
                      <div className="font-bold">{dayNames[index]}</div>
                      <div className="text-sm">{formatDate(dateItem.dateObj)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((slotNumber) => (
                  <tr key={slotNumber}>
                    <td className="border border-gray-300 bg-gray-50 p-3 text-center font-semibold text-sm">
                      Slot {slotNumber}
                    </td>
                    {weekDates.map((dateItem, dateIndex) => {
                      const slots = getSlotsForDate(dateItem.dateStr);
                      const slot = slots[slotNumber - 1];

                      return (
                        <td
                          key={dateIndex}
                          className="border border-gray-300 p-2 align-top"
                        >
                          {slot ? (
                            <div 
                              className="text-xs space-y-1 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                              onClick={() => {
                                const dateStr = slot.date;
                                const masterSlotId = slot.masterSlotId;
                                if (masterSlotId && dateStr) {
                                  navigate(`/dealer-staff/test-drive-bookings/${dateStr}/${masterSlotId}`);
                                }
                              }}
                            >
                              <div className="font-bold text-blue-700">
                                {slot.code}
                              </div>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${slot.statusColor}`}>
                                ({slot.displayStatus})
                              </div>
                              <div className="text-green-700 font-medium">
                                ({minutesToTime(slot.startOffsetMinutes)}-
                                {minutesToTime(slot.startOffsetMinutes + slot.durationMinutes)})
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-center text-gray-400 cursor-pointer hover:bg-green-50 p-4 rounded transition-colors"
                              onClick={() => {
                                // Navigate to create page with date param
                                navigate(`/dealer-staff/test-drive-bookings/create?date=${dateItem.dateStr}`);
                              }}
                              title="Click để tạo đặt chỗ"
                            >
                              <div className="text-gray-300 hover:text-green-600 transition-colors">+</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDriveBookingsPage;
