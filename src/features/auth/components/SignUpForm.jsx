import React from "react";
import signupBg from "../../../assets/images/signupbackground.png";

const SignUpForm = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="relative w-full">
        {/* Hero Section với Background Image */}
        <div
          className="relative overflow-hidden bg-cover bg-center rounded-3xl"
          style={{
            backgroundImage: `url(${signupBg})`,
            minHeight: "350px",
          }}
        >
          {/* Welcome Text */}
          <div className="relative z-10 text-center py-16 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome!
            </h1>
            <p className="text-white text-opacity-90 text-sm md:text-base max-w-md mx-auto">
              Create new account to get started
            </p>
          </div>
        </div>

        {/* Form Card - overlap với hero section */}
        <div className="relative -mt-20 mx-4 md:mx-auto max-w-md pb-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
              Register with
            </h2>

            {/* Google Sign In Button */}
            <button className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 mb-4 flex items-center justify-center hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                  placeholder="Your email address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                  placeholder="Your password"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleFormSubmit}
                className="w-full bg-teal-500 text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition duration-200 shadow-md uppercase text-sm tracking-wide"
              >
                Sign Up
              </button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <span className="text-teal-500 font-semibold hover:text-teal-600 cursor-pointer">
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
