import React from "react";
import { useSignUp } from "../hooks/useSignUp";

const SignUpForm = () => {
  const { form, onSubmit } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center">Đăng ký tài khoản</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Nhập email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Nhập mật khẩu"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Xác nhận mật khẩu
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Nhập lại mật khẩu"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Đăng ký
      </button>
    </form>
  );
};

export default SignUpForm;
