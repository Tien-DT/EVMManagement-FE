import React, { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const TestDriveSchedulePage = () => {
  const { showError } = useNotification();
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

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

  // Fetch schedule data
  useEffect(() => {
    if (!dealerId) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          endpoints.vehicleTimeSlots.getByDealer(dealerId),
          {
            params: {
              pageNumber: 1,
              pageSize: 1000, // Get all data
            },
          }
        );

        console.log("🔥 Full Response:", response);
        console.log("🔥 Response.success:", response.success);
        console.log("🔥 Response.data:", response.data);

        // axiosInstance already unwraps response.data, so response is the actual data
        if (response.success) {
          const items = response.data?.items || [];
          console.log("✅ Setting schedule data, count:", items.length);
          console.log("✅ Items:", items);
          setScheduleData(items);
        } else {
          console.log("❌ API response success = false");
          console.log("❌ Response:", response);
        }
      } catch (error) {
        console.error("❌ Error fetching schedule:", error);
        showError("Không thể tải lịch lái thử");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  // Generate weeks for selected year
  const weeksInYear = useMemo(() => {
    const weeks = [];
    const startDate = new Date(selectedYear, 0, 1);
    
    // Find first Monday of the year
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

  // Get dates for selected week
  const weekDates = useMemo(() => {
    if (!weeksInYear[selectedWeekIndex]) return [];
    
    const { start } = weeksInYear[selectedWeekIndex];
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, [weeksInYear, selectedWeekIndex]);

  // Convert startOffsetMinutes to time string (HH:mm)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Format date to YYYY-MM-DD without timezone conversion
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Process schedule data for the selected week
  const processedSchedule = useMemo(() => {
    const result = {};

    weekDates.forEach((date) => {
      const dateKey = formatDateKey(date);
      result[dateKey] = {};
    });

    console.log("📅 Week dates keys:", Object.keys(result));
    console.log("📊 Schedule data count:", scheduleData.length);

    // Group by date and master slot
    scheduleData.forEach((item) => {
      // Extract date directly from slotDate string (ignore timezone)
      const dateKey = item.slotDate.split("T")[0];
      
      console.log("🔍 Checking item dateKey:", dateKey, "exists in result?", !!result[dateKey]);
      
      // Only include if date is in current week
      if (!result[dateKey]) return;

      const masterSlotId = item.masterSlotId;
      
      if (!result[dateKey][masterSlotId]) {
        result[dateKey][masterSlotId] = {
          code: item.masterSlot.code,
          startOffsetMinutes: item.masterSlot.startOffsetMinutes,
          durationMinutes: item.masterSlot.durationMinutes,
          items: [],
        };
      }
      
      result[dateKey][masterSlotId].items.push(item);
    });

    // Determine status for each slot (if any item is BOOKED, show BOOKED)
    Object.keys(result).forEach((dateKey) => {
      Object.keys(result[dateKey]).forEach((masterSlotId) => {
        const slot = result[dateKey][masterSlotId];
        const hasBooked = slot.items.some((item) => item.status === "BOOKED");
        slot.displayStatus = hasBooked ? "đã đặt" : "còn trống";
        slot.statusColor = hasBooked ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";
      });
    });

    return result;
  }, [scheduleData, weekDates]);

  // Get slots for a specific date, sorted by start time, limited to 4 slots
  const getSlotsForDate = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    const slotsForDate = processedSchedule[dateKey] || {};
    
    // Convert to array and sort by startOffsetMinutes
    const sortedSlots = Object.values(slotsForDate).sort(
      (a, b) => a.startOffsetMinutes - b.startOffsetMinutes
    );
    
    // Return only first 4 slots
    return sortedSlots.slice(0, 4);
  };

  // Format date for display (dd/MM)
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Lịch Lái Thử
        </h1>
        <p className="text-gray-600 mt-2">
          Xem lịch các xe lái thử theo tuần
        </p>
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
                disabled={selectedWeekIndex === 0}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <select
                value={selectedWeekIndex}
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
                disabled={selectedWeekIndex === weeksInYear.length - 1}
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
                  {weekDates.map((date, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 bg-blue-500 text-white p-3 text-center"
                    >
                      <div className="font-bold">{dayNames[index]}</div>
                      <div className="text-sm">{formatDate(date)}</div>
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
                    {weekDates.map((date, dateIndex) => {
                      const slots = getSlotsForDate(date);
                      const slot = slots[slotNumber - 1];

                      return (
                        <td
                          key={dateIndex}
                          className="border border-gray-300 p-2 align-top"
                        >
                          {slot ? (
                            <div className="text-xs space-y-1">
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
                            <div className="text-center text-gray-400">-</div>
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

export default TestDriveSchedulePage;
