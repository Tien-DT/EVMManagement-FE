import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChangePassword } from "../hooks/useChangePassword";

const ChangePasswordForm = () => {
  const { form, onSubmit, isLoading, error, success, setError, setSuccess } = useChangePassword();
  const { register, handleSubmit, formState: { errors } } = form;
  const navigate = useNavigate();

  // Auto-dismiss success and redirect to profile
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
        navigate("/admin/profile", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, setSuccess, navigate]);

  return (
    <div className="relative">
      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd" />
              </svg>
              <p className="text-sm ml-2">{success}</p>
              <button onClick={() => setSuccess(null)} className="ml-3 text-sm text-green-700 hover:text-green-800">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h2>
        <p className="text-gray-600 mb-6">Update your account password below.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3"><p className="text-sm">{error}</p></div>
              <div className="ml-auto pl-3">
                <button onClick={() => setError(null)} className="text-sm text-red-600 hover:text-red-700">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
            <input
              type="password"
              {...register("oldPassword")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.oldPassword ? "border-red-300" : "border-gray-300"}`}
              placeholder="Enter your old password"
            />
            {errors.oldPassword && (<p className="mt-1 text-sm text-red-600">{errors.oldPassword.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              {...register("newPassword")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.newPassword ? "border-red-300" : "border-gray-300"}`}
              placeholder="Enter your new password"
            />
            {errors.newPassword && (<p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              {...register("confirmNewPassword")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.confirmNewPassword ? "border-red-300" : "border-gray-300"}`}
              placeholder="Confirm your new password"
            />
            {errors.confirmNewPassword && (<p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>)}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 rounded-lg transition duration-200 shadow-md ${isLoading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-teal-500 text-white hover:bg-teal-600"}`}
          >
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
