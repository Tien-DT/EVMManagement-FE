// src/utils/timeUtils.js

/**
 * Chuyển đổi phút thành giờ:phút (HH:MM)
 * @param {number} minutes - Tổng số phút
 * @returns {string} - Chuỗi định dạng HH:MM
 */
export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };
  
  /**
   * Tính thời gian bắt đầu từ startOffsetMinutes
   * @param {number} startOffsetMinutes
   * @returns {string} - Chuỗi định dạng HH:MM
   */
  export const getStartTime = (startOffsetMinutes) => {
    return minutesToTime(startOffsetMinutes);
  };
  
  /**
   * Tính thời gian kết thúc từ startOffsetMinutes và durationMinutes
   * @param {number} startOffsetMinutes
   * @param {number} durationMinutes
   * @returns {string} - Chuỗi định dạng HH:MM
   */
  export const getEndTime = (startOffsetMinutes, durationMinutes) => {
    const endMinutes = startOffsetMinutes + durationMinutes;
    return minutesToTime(endMinutes);
  };
  
  /**
   * Tính khoảng thời gian (duration) giữa 2 thời điểm
   * @param {number} startHour
   * @param {number} startMinute
   * @param {number} endHour
   * @param {number} endMinute
   * @returns {number} - Số phút
   */
  export const calculateDuration = (startHour, startMinute, endHour, endMinute) => {
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    return endTotal - startTotal;
  };
  
  /**
   * Tính startOffsetMinutes từ giờ và phút
   * @param {number} hour
   * @param {number} minute
   * @returns {number} - Số phút
   */
  export const timeToMinutes = (hour, minute) => {
    return hour * 60 + minute;
  };