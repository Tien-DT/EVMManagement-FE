// src/features/dealer-staff/schemas/customerSchema.js
import { z } from "zod";

export const customerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ tên chỉ được chứa chữ cái"),

  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),

  email: z.string().email("Email không hợp lệ").toLowerCase(),

  gender: z.string().min(1, "Vui lòng chọn giới tính"),

  address: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(200, "Địa chỉ không được quá 200 ký tự"),

  dob: z
    .string()
    .or(z.date())
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 18 && age <= 100;
    }, "Khách hàng phải từ 18 đến 100 tuổi"),

  cardId: z
    .string()
    .regex(/^[0-9]{9}$|^[0-9]{12}$/, "CCCD phải là 9 hoặc 12 số"),
});
