import React, { useEffect, useState } from "react";
import { authService } from "../../auth/services/authService";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user, setUser, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // If there is no user loaded yet but auth is not loading, try fetching profile
    const maybeFetch = async () => {
      if (!loading && !user) {
        try {
          const me = await authService.getMe();
          setUser(me);
        } catch (err) {
          setError(typeof err === "string" ? err : err?.message || "Failed to load profile");
        }
      }
    };
    maybeFetch();
  }, [loading, user, setUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">My Profile</h1>
        <Link
          to="/admin/change-password"
          className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700"
        >
          Change Password
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl mr-4">
            {user?.fullName?.[0] || user?.name?.[0] || "👤"}
          </div>
          <div>
            <p className="text-lg font-medium text-slate-800">{user?.fullName || user?.name || "Unnamed User"}</p>
            <p className="text-slate-500">{user?.email || "No email"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-500">User ID</p>
            <p className="font-medium text-slate-800 break-all">{user?.id ?? "—"}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-medium text-slate-800">{user?.role ?? "—"}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-500">Phone</p>
            <p className="font-medium text-slate-800">{user?.phone ?? "—"}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-500">Dealer</p>
            <p className="font-medium text-slate-800">{user?.dealerId ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


