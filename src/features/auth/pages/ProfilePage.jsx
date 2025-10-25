import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useNotification } from "../../../context/NotificationContext";
import userProfileService from "../../../services/userProfileService";

const ProfilePage = () => {
  const { user: authUser, setUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [error, setError] = useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    cardId: "",
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      // Use accountId from authUser, fallback to id if accountId doesn't exist
      const accountId = authUser?.accountId || authUser?.id;
      
      if (!accountId || hasLoaded) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Call API to get user profile by accountId
        const response = await authService.getUserProfileByAccount(accountId);
        
        if (response.success && response.data) {
          setProfileData(response.data);
          
          // Update auth context with complete user data
          const updatedUser = {
            ...authUser,
            fullName: response.data.fullName,
            phone: response.data.phone,
            cardId: response.data.cardId,
            dealerId: response.data.dealerId,
            role: response.data.account?.role || authUser.role,
            isActive: response.data.account?.isActive,
          };
          setUser(updatedUser);
          setHasLoaded(true);
        } else {
          const errorMessage = "Failed to load profile data";
          setError(errorMessage);
          showError(errorMessage);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        const errorMessage = err?.message || "Failed to load profile";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasLoaded) {
      fetchProfile();
    }
  }, [authUser?.accountId, authUser?.id, hasLoaded]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayData = profileData || authUser;

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleEdit = () => {
    setEditForm({
      fullName: displayData?.fullName || "",
      phone: displayData?.phone || "",
      cardId: displayData?.cardId || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: "",
      phone: "",
      cardId: "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accountId = authUser?.accountId || authUser?.id;
      
      // Use PUT method with account ID
      const response = await userProfileService.updateByAccount(accountId, editForm);
      
      console.log("Update response:", response);
      
      if (response.data) {
        setProfileData(response.data);
        setIsEditing(false);
        showSuccess("Profile updated successfully!");
        
        // Update auth context
        const updatedUser = {
          ...authUser,
          ...editForm,
        };
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update profile";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleChangePassword}
                className="px-3 py-1.5 rounded-md bg-blue-600 border border-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700">
              {displayData?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="ml-5">
              <h2 className="text-xl font-semibold text-gray-900">{displayData?.fullName || "Unnamed User"}</h2>
              <p className="text-sm text-gray-600 mt-1">{authUser?.email || "No email"}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {displayData?.account?.role || displayData?.role || "No Role"}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h3>
          
          {isEditing ? (
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Card ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Card ID
                </label>
                <input
                  type="text"
                  value={editForm.cardId}
                  onChange={(e) => setEditForm({ ...editForm, cardId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter card ID"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Full Name */}
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-sm text-gray-900">
                  {displayData?.fullName || "—"}
                </p>
              </div>

              {/* Phone Number */}
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                <p className="text-sm text-gray-900">
                  {displayData?.phone || "—"}
                </p>
              </div>

              {/* Card ID */}
              <div className="pb-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Card ID</p>
                <p className="text-sm text-gray-900">
                  {displayData?.cardId || "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
