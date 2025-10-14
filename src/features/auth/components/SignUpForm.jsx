import React from "react";
import { Link } from "react-router-dom";
import signupBg from "../../../assets/images/signupbackground.png";
import { useSignUp } from "../hooks/useSignUp";

const SignUpForm = () => {
  const { form, onSubmit, isLoading, error, setError } = useSignUp();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="relative w-full">
        {/* Hero Section với Background Image */}
        <div
          className="relative overflow-hidden bg-cover bg-center rounded-2xl sm:rounded-3xl"
          style={{
            backgroundImage: `url(${signupBg})`,
            minHeight: "280px",
          }}
        >
          {/* Welcome Text */}
          <div className="relative z-10 text-center py-12 sm:py-16 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome!
            </h1>
            <p className="text-white text-opacity-90 text-sm md:text-base max-w-md mx-auto">
              Create new account to get started
            </p>
          </div>
        </div>

        {/* Form Card - overlap với hero section */}
        <div className="relative -mt-16 sm:-mt-20 mx-2 sm:mx-4 md:mx-auto max-w-md pb-8 sm:pb-12">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-4 sm:mb-6">
              Register an Account
            </h2>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.fullName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Card ID Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Card ID
                </label>
                <input
                  type="text"
                  {...register("cardId")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.cardId ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your card ID"
                />
                {errors.cardId && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardId.message}</p>
                )}
              </div>

              {/* Dealer ID Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Dealer ID
                </label>
                <input
                  type="text"
                  {...register("dealerId")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.dealerId ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Dealer UUID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
                />
                {errors.dealerId && (
                  <p className="mt-1 text-xs text-red-600">{errors.dealerId.message}</p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  {...register("role")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.role ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="EVM_ADMIN">EVM Admin</option>
                  <option value="DEALER">Dealer</option>
                  <option value="USER">User</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm ${
                    errors.confirmPassword ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-semibold py-3 rounded-lg transition duration-200 shadow-md uppercase text-sm tracking-wide ${
                  isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 mt-4 sm:mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
