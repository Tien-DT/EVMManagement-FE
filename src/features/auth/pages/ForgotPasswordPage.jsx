import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPasswordPage = () => {
  const {
    step,
    emailForm,
    otpForm,
    passwordForm,
    onEmailSubmit,
    onOtpSubmit,
    onPasswordSubmit,
    isLoading,
    error,
    setError,
    successMessage,
    userEmail,
    goBack,
    resendCode,
  } = useForgotPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= i
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > i ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Email</span>
            <span>Verify</span>
            <span>Reset</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify Code"}
            {step === 3 && "Reset Password"}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the code sent to your email"}
            {step === 3 && "Create a new secure password"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            <div className="flex">
              <div className="ml-0">
                <p className="text-sm">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
            <input
              type="email"
                {...emailForm.register("email")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  emailForm.formState.errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 rounded-lg transition duration-200 shadow-md uppercase text-sm tracking-wide ${
                isLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === 2 && (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                {...otpForm.register("otp")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-center text-lg tracking-widest ${
                  otpForm.formState.errors.otp ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="000000"
                maxLength="10"
                disabled={isLoading}
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-1 text-sm text-red-600">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                Code sent to <span className="font-semibold">{userEmail}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 rounded-lg transition duration-200 shadow-md uppercase text-sm tracking-wide ${
                isLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={resendCode}
              disabled={isLoading}
              className="w-full text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              Didn't receive code? Resend
            </button>
          </form>
        )}

        {/* Step 3: Password Reset Form */}
        {step === 3 && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...passwordForm.register("newPassword")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    passwordForm.formState.errors.newPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...passwordForm.register("confirmPassword")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    passwordForm.formState.errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 rounded-lg transition duration-200 shadow-md uppercase text-sm tracking-wide ${
                isLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
              {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        )}

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          {step > 1 && step < 3 && (
            <button
              onClick={goBack}
              className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
            >
              ← Go back
            </button>
          )}
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
