import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";

const ProfilePage = () => {
  const { user: authUser, setUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser?.id) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Call API to get user profile by accountId
        const response = await authService.getUserProfile(authUser.id);
        
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
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser?.id]);

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
    // Navigate to change password page or open modal
    // For now, we can navigate to forgot password or create a dedicated change password page
    window.location.href = "/forgot-password";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">My Profile</h1>
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Change Password
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-4 border-white/30">
              {displayData?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{displayData?.fullName || "Unnamed User"}</h2>
              <p className="text-teal-50 mt-1">{authUser?.email || "No email"}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                {displayData?.account?.role || displayData?.role || "No Role"}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-500 mb-1">Full Name</p>
              <p className="font-medium text-slate-800">
                {displayData?.fullName || "—"}
              </p>
            </div>

            {/* Phone Number */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-500 mb-1">Phone Number</p>
              <p className="font-medium text-slate-800">
                {displayData?.phone || "—"}
              </p>
            </div>

            {/* Card ID */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 md:col-span-2">
              <p className="text-sm text-slate-500 mb-1">Card ID</p>
              <p className="font-medium text-slate-800">
                {displayData?.cardId || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
