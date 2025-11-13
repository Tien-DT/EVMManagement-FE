// src/features/dealer-staff/pages/TestDriveBookingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Car,
  Send,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bell,
  Clock,
} from "lucide-react";
import { useTestDriveBookings } from "../hooks/useTestDriveBookings";
import { useCreateTestDriveBooking } from "../hooks/useCreateTestDriveBooking";
import { useDealerCustomers } from "../hooks/useDealerCustomers";
import { useAuth } from "../../../context/AuthContext";
import CheckInOutModal from "../components/CheckInOutModal";

const TestDriveBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [filters, setFilters] = useState({
    dealerId: null,
    customerId: "",
    status: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const { bookings, loading, error, pagination, fetchBookings, changePage, refresh } =
    useTestDriveBookings(filters, false);

  const { sendConfirmation, sendReminder, updateCheckInOut, isSubmitting } = useCreateTestDriveBooking();
  const { customers, isLoading: isLoadingCustomers } = useDealerCustomers(dealerId);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showCheckInOutModal, setShowCheckInOutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get dealerId
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          setDealerId(cachedDealerId);
          setFilters((prev) => ({ ...prev, dealerId: cachedDealerId }));
          return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const userObj = JSON.parse(userStr);
        if (userObj.dealerId) {
          setDealerId(userObj.dealerId);
          setFilters((prev) => ({ ...prev, dealerId: userObj.dealerId }));
        } else {
          const { dealerService } = await import(
            "../../dealer-manager/services/dealerService"
          );
          const profileResponse = await dealerService.getUserProfile(userObj.id);
          if (profileResponse.success && profileResponse.data) {
            const profile = profileResponse.data;
            localStorage.setItem("dealerId", profile.dealerId);
            setDealerId(profile.dealerId);
            setFilters((prev) => ({ ...prev, dealerId: profile.dealerId }));
          }
        }
      } catch (error) {
        console.error("Error fetching dealerId:", error);
      }
    };

    fetchDealerId();
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    if (filters.dealerId) {
      fetchBookings(filters);
      // Clear selected bookings when filters change
      setSelectedBookings([]);
      setSelectAll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dealerId, filters.customerId, filters.status, filters.pageNumber]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      pageNumber: 1, // Reset to first page when filter changes
    }));
  };

  const handleSendConfirmation = async (bookingId) => {
    if (window.confirm("Are you sure you want to send a confirmation for this booking?")) {
      const result = await sendConfirmation(bookingId);
      if (result.success) {
        refresh();
      }
    }
  };

  const handleOpenCheckInOut = (booking) => {
    setSelectedBooking(booking);
    setShowCheckInOutModal(true);
  };

  const handleCloseCheckInOut = () => {
    setShowCheckInOutModal(false);
    setSelectedBooking(null);
  };

  const handleUpdateCheckInOut = async (bookingId, checkinAt, checkoutAt, action) => {
    const result = await updateCheckInOut(bookingId, checkinAt, checkoutAt, action);
    if (result.success) {
      handleCloseCheckInOut();
      refresh();
    }
  };

  const handleSendReminder = async () => {
    if (selectedBookings.length === 0) {
      alert("Please select at least one booking to send a reminder");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to send reminders for the ${selectedBookings.length} selected bookings?`
      )
    ) {
      const result = await sendReminder(selectedBookings);
      if (result.success) {
        setSelectedBookings([]);
        setSelectAll(false);
        refresh();
      }
    }
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings((prev) => {
      if (prev.includes(bookingId)) {
        return prev.filter((id) => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
      setSelectAll(false);
    } else {
      const allBookingIds = bookings.map((booking) => booking.id);
      setSelectedBookings(allBookingIds);
      setSelectAll(true);
    }
  };

  // Update selectAll state when selectedBookings changes
  useEffect(() => {
    if (bookings.length > 0) {
      setSelectAll(selectedBookings.length === bookings.length && bookings.length > 0);
    }
  }, [selectedBookings, bookings]);

  const getStatusBadge = (status) => {
    const statusMap = {
      BOOKED: { color: "bg-blue-100 text-blue-800", text: "Booked" },
      CHECKED_IN: { color: "bg-yellow-100 text-yellow-800", text: "Checked in" },
      COMPLETED: { color: "bg-green-100 text-green-800", text: "Completed" },
      CANCELED: { color: "bg-red-100 text-red-800", text: "Canceled" },
    };

    const statusInfo = statusMap[status] || { color: "bg-gray-100 text-gray-800", text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US");
  };

  if (loading && !bookings.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking list...</p>
        </div>
      </div>
    );
  }

  if (error && !bookings.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refresh()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Drive Booking Management</h1>
          <p className="text-gray-600 mt-1">Browse and manage test drive bookings</p>
        </div>
        <button
          onClick={() => navigate("/dealer-staff/test-drive-bookings/create")}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Create booking</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange("customerId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName || customer.name} - {customer.phone || ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="CHECKED_IN">Checked in</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            {selectedBookings.length > 0 && (
              <button
                onClick={handleSendReminder}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Bell size={18} />
                <span>Send reminder ({selectedBookings.length})</span>
              </button>
            )}
            <button
              onClick={() => refresh()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created at
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {booking.customer?.fullName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.customer?.fullName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.customer?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Car size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {booking.vehicleTimeslot?.vehicleName || booking.vehicleTimeslot?.testDriveVehicle?.vehicleName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{formatDate(booking.createdAt || booking.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.checkinAt ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Clock size={14} />
                        <span>{formatDate(booking.checkinAt)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.checkoutAt ? (
                      <div className="flex items-center space-x-2 text-sm text-orange-600">
                        <Clock size={14} />
                        <span>{formatDate(booking.checkoutAt)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {booking.note || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenCheckInOut(booking)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Check-in/Check-out"
                      >
                        <Clock size={18} />
                      </button>
                      {booking.status === "BOOKED" && (
                        <button
                          onClick={() => handleSendConfirmation(booking.id)}
                          disabled={isSubmitting}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Send confirmation"
                        >
                          <Send size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/dealer-staff/test-drive-bookings/${booking.id}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {bookings.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.customerId || filters.status
                ? "Try adjusting the filters"
                : "Create the first booking to get started"}
            </p>
            {!filters.customerId && !filters.status && (
              <button
                onClick={() => navigate("/dealer-staff/test-drive-bookings/create")}
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                <span>Create booking</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {bookings.length} of {pagination.totalItems} bookings
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Check-in/Check-out Modal */}
      <CheckInOutModal
        isOpen={showCheckInOutModal}
        onClose={handleCloseCheckInOut}
        booking={selectedBooking}
        onUpdate={handleUpdateCheckInOut}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TestDriveBookingsPage;
