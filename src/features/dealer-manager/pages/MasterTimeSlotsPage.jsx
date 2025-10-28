import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Plus, Edit2, Trash2, Power, Search, Car } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import masterTimeSlotService from "../services/masterTimeSlotService";

const MasterTimeSlotsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [masterTimeSlots, setMasterTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    startTime: "", // Changed to store time string (HH:mm)
    durationMinutes: "",
    isActive: true,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Helper: Convert minutes to HH:mm format
  const minutesToTime = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === "") return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Helper: Convert HH:mm to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Fetch dealerId from userProfile API - same as other dealer manager pages
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.log("No user.id found");
        setLoadingProfile(false);
        return;
      }

      try {
        console.log("Fetching user profile for account:", user.id);
        const response = await axiosInstance.get(
          endpoints.userProfile.getByAccount(user.id)
        );

        console.log("UserProfile API response:", response);

        if (response.success && response.data) {
          const userDealerId = response.data.dealerId;

          if (userDealerId) {
            console.log("✅ Found dealerId:", userDealerId);
            setDealerId(userDealerId);

            // Also save to sessionStorage for consistency
            sessionStorage.setItem(
              "userProfile",
              JSON.stringify(response.data)
            );
          } else {
            console.error("❌ No dealerId in profile");
            toast.error("Không tìm thấy dealerId trong profile");
          }
        } else {
          console.error("Profile API unsuccessful:", response);
          toast.error("Không tìm thấy thông tin dealer");
        }
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
        toast.error("Lỗi khi lấy thông tin dealer: " + error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDealerId();
  }, [user?.id]);

  // Fetch master time slots
  const fetchMasterTimeSlots = async () => {
    if (!dealerId) {
      console.log("Waiting for dealerId...");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching master time slots for dealer:", dealerId);

      // Use getByDealerId API
      const response = await masterTimeSlotService.getByDealerId(dealerId, {
        pageNumber: currentPage,
        pageSize: pageSize,
      });

      console.log("API Response:", response);

      // Check the response structure
      if (response) {
        // Handle ApiResponse<PagedResult<T>> structure
        if (response.success !== undefined) {
          // Response with success flag
          if (response.success && response.data) {
            setMasterTimeSlots(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
            console.log("Master time slots loaded:", response.data.items);
          } else {
            console.warn("API returned success: false", response);
            toast.error(response.message || "Failed to load master time slots");
            setMasterTimeSlots([]);
          }
        } else if (response.data) {
          // Direct data response
          setMasterTimeSlots(response.data.items || []);
          setTotalPages(response.data.totalPages || 1);
        } else if (response.items) {
          // Direct PagedResult response
          setMasterTimeSlots(response.items || []);
          setTotalPages(response.totalPages || 1);
        } else if (Array.isArray(response)) {
          // Direct array response
          setMasterTimeSlots(response);
          setTotalPages(1);
        } else {
          console.warn("Unexpected response structure:", response);
          setMasterTimeSlots([]);
        }
      } else {
        console.warn("No response received");
        setMasterTimeSlots([]);
      }
    } catch (error) {
      console.error("Error fetching master time slots:", error);
      toast.error("Failed to fetch master time slots");
    } finally {
      setLoading(false);
    }
  };

  // Fetch master time slots when dealerId is available or page changes
  useEffect(() => {
    if (dealerId && !loadingProfile) {
      fetchMasterTimeSlots();
    }
  }, [dealerId, currentPage, loadingProfile]);

  // Handle create/update form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dealerId) {
      toast.error("Dealer ID not found");
      return;
    }

    try {
      const payload = {
        code: formData.code,
        startOffsetMinutes: timeToMinutes(formData.startTime), // Convert time to minutes
        durationMinutes: formData.durationMinutes
          ? parseInt(formData.durationMinutes)
          : null,
        isActive: formData.isActive,
        dealerId: dealerId, // Include dealerId from state
      };

      let response;
      if (showEditModal && selectedSlot) {
        response = await masterTimeSlotService.update(selectedSlot.id, payload);
        toast.success("Master Time Slot updated successfully");
      } else {
        response = await masterTimeSlotService.create(payload);
        toast.success("Master Time Slot created successfully");
      }

      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedSlot(null);

      // Refresh data
      fetchMasterTimeSlots();
    } catch (error) {
      console.error("Error saving master time slot:", error);
      toast.error(error.message || "Failed to save master time slot");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await masterTimeSlotService.delete(id);
      toast.success("Master Time Slot deleted successfully");
      setDeleteConfirmId(null);
      fetchMasterTimeSlots();
    } catch (error) {
      console.error("Error deleting master time slot:", error);
      toast.error("Failed to delete master time slot");
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await masterTimeSlotService.updateIsActive(id, !currentStatus);
      toast.success(
        `Master Time Slot ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`
      );
      fetchMasterTimeSlots();
    } catch (error) {
      console.error("Error updating master time slot status:", error);
      toast.error("Failed to update master time slot status");
    }
  };

  // Handle edit button click
  const handleEdit = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      code: slot.code,
      startTime: minutesToTime(slot.startOffsetMinutes), // Convert minutes to time
      durationMinutes: slot.durationMinutes || "",
      isActive: slot.isActive,
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      startTime: "",
      durationMinutes: "",
      isActive: true,
    });
  };

  // Filter slots based on search query
  const filteredSlots = masterTimeSlots.filter((slot) =>
    slot.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time from minutes
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate end time
  const calculateEndTime = (startMinutes, durationMinutes) => {
    if (startMinutes === null || durationMinutes === null) return "N/A";
    const endMinutes = startMinutes + durationMinutes;
    return formatTime(endMinutes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Master Time Slots Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your dealership's master time slots
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Time Slot
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {loadingProfile || loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              {loadingProfile && (
                <span className="ml-3 text-gray-600">Loading profile...</span>
              )}
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No time slots found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first master time slot.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {slot.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(slot.startOffsetMinutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.durationMinutes
                          ? `${slot.durationMinutes} mins`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateEndTime(
                          slot.startOffsetMinutes,
                          slot.durationMinutes
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            slot.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {slot.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleToggleActive(slot.id, slot.isActive)
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              slot.isActive
                                ? "text-gray-600 hover:bg-gray-100"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={slot.isActive ? "Deactivate" : "Activate"}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(slot)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(slot.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } ${index === 0 ? "rounded-l-md" : ""} ${
                          index === totalPages - 1 ? "rounded-r-md" : ""
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedSlot(null);
              }}
            ></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                {showEditModal
                  ? "Edit Master Time Slot"
                  : "Create Master Time Slot"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., MORNING-01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 09:00"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-left">
                      Select the start time for this slot
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 60 for 1 hour"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700 text-left"
                    >
                      Active
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedSlot(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {showEditModal ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setDeleteConfirmId(null)}
            ></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this master time slot? This
                action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterTimeSlotsPage;
