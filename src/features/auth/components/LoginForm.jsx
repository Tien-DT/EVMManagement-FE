import React from "react";
import { Link } from "react-router-dom";
import loginBg from "../../../assets/images/loginbackground.png";
import { useLogin } from "../hooks/useLogin";

const LoginForm = () => {
  const { form, onSubmit, isLoading, error, setError } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 text-center">
            Welcome Back!
          </h1>
          <p className="text-lg xl:text-xl text-center max-w-md">
            Sign in to continue your journey with us
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Background */}
          <div
            className="lg:hidden w-full h-40 sm:h-48 bg-cover bg-center rounded-t-2xl mb-6 relative"
            style={{
              backgroundImage: `url(${loginBg})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-2xl"></div>
            <div className="relative z-10 flex flex-col justify-center items-center text-white h-full px-4">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
                Welcome Back!
              </h1>
              <p className="text-sm text-center">Sign in to continue</p>
            </div>
          </div>

          <div className="bg-white lg:bg-transparent p-4 sm:p-6 lg:p-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Sign in
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Enter your credentials to access your account
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
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
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-teal-600 font-semibold hover:text-teal-700 text-sm"
                >
                  Forgot password?
                </a>
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
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
