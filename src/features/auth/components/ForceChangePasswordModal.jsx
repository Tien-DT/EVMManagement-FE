import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../services/authService";
import { useNotification } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import { KeyRound, X, AlertCircle } from "lucide-react";

// Schema for change password validation (without current password for first-time login)
const forceChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt"
    ),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

const ForceChangePasswordModal = ({ isOpen, onClose, onSkip, onPasswordChanged }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { user, setUser } = useAuth();

  const form = useForm({
    resolver: zodResolver(forceChangePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Changing password for first-time login...");
      
      // Get temporary password from localStorage (stored during login)
      const tempPassword = localStorage.getItem("temp_password_for_change") || "";
      
      // Use the account's current password (temporary password from admin)
      // This is the password they just used to login
      const response = await authService.changePassword({
        currentPassword: tempPassword,
        newPassword: data.newPassword,
      });

      console.log("Change password response:", response);

      // Handle different response structures
      const isSuccess = response?.success === true || 
                       response?.success === undefined || 
                       response?.status === 200 ||
                       response?.status === 201 ||
                       response?.data?.success === true ||
                       (response?.data && !response?.data?.error);

      if (isSuccess) {
        console.log("Password change successful!");
        setSuccess(true);
        showSuccess("Đổi mật khẩu thành công! Bạn có thể tiếp tục sử dụng hệ thống.");
        
        // Remove temp password from localStorage
        localStorage.removeItem("temp_password_for_change");
        
        // Mark password as changed in localStorage
        if (user?.id) {
          localStorage.setItem(`password_changed_${user.id}`, "true");
        }
        
        // Update user to remove mustChangePassword flag
        if (user) {
          setUser({
            ...user,
            mustChangePassword: false,
            isPasswordChanged: true,
          });
        }
        
        // Call callback if provided
        if (onPasswordChanged) {
          onPasswordChanged();
        }
        
        form.reset();
        // Auto close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        const errorMessage = response?.message || response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
        console.log("Password change failed:", errorMessage);
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      console.error("Change password error:", err);
      console.error("Error response:", err.response);
      
      // Check if error is because we need current password
      // If so, try with a different approach - maybe backend needs old password
      if (err?.response?.status === 400 || err?.response?.status === 401) {
        const errorMessage = err?.response?.data?.message || err?.message || "Mật khẩu hiện tại không đúng hoặc bạn cần nhập mật khẩu hiện tại.";
        setError(errorMessage);
        showError(errorMessage);
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
        setError(errorMessage);
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !success) {
      if (onSkip) {
        onSkip();
      } else {
        onClose();
      }
    }
  };

  const handleSkip = () => {
    if (!isLoading) {
      // Mark as skipped in localStorage to remember user's choice
      if (user?.id) {
        localStorage.setItem(`password_change_skipped_${user.id}`, "true");
      }
      
      // Update user to indicate skip
      if (user) {
        setUser({
          ...user,
          passwordChangeSkipped: true,
        });
      }
      
      if (onSkip) {
        onSkip();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-teal-50">
          <div className="flex items-center space-x-3">
            <KeyRound className="text-teal-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Đổi mật khẩu
            </h2>
          </div>
          {!success && !isLoading && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Đổi mật khẩu thành công!
              </h3>
              <p className="text-gray-600">
                Mật khẩu của bạn đã được cập nhật thành công.
              </p>
            </div>
          ) : (
            <>
              {/* Info Alert */}
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    Đây là lần đầu bạn đăng nhập. Vui lòng đổi mật khẩu để bảo mật tài khoản của bạn.
                  </p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...form.register("newPassword")}
                    type="password"
                    id="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu mới"
                    autoFocus
                  />
                  {form.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...form.register("confirmPassword")}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang đổi...
                      </>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForceChangePasswordModal;

