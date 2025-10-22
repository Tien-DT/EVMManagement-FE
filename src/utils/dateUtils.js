// src/utils/dateUtils.js
import moment from 'moment';

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: DD/MM/YYYY)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: DD/MM/YYYY HH:mm)
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  return moment(date).isBefore(moment());
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  return moment(date).isAfter(moment());
};

/**
 * Get start of day
 * @param {string|Date} date - Date to get start of day
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date = new Date()) => {
  return moment(date).startOf('day').toDate();
};

/**
 * Get end of day
 * @param {string|Date} date - Date to get end of day
 * @returns {Date} End of day
 */
export const getEndOfDay = (date = new Date()) => {
  return moment(date).endOf('day').toDate();
};