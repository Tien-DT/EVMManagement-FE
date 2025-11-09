// src/features/dealer-staff/schemas/customerSchema.js
import { z } from "zod";

export const customerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên là bắt buộc")
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ tên chỉ được chứa chữ cái và khoảng trắng"),

  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VD: 0912345678 hoặc 0123456789)"),

  email: z.string().email("Email không hợp lệ").toLowerCase(),

  gender: z.string().min(1, "Vui lòng chọn giới tính"),

  address: z
    .string()
    .refine((val) => val === "" || (val.length >= 10 && val.length <= 200), {
      message: "Địa chỉ phải có từ 10 đến 200 ký tự hoặc để trống",
    }),

  dob: z
    .string()
    .refine((val) => {
      // Allow empty string
      if (val === "") return true;
      
      const date = new Date(val);
      // Check if date is valid
      if (isNaN(date.getTime())) return false;
      
      // Check if date is in the future
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate > now) return false;
      
      // Calculate age accurately
      const age = now.getFullYear() - date.getFullYear();
      const monthDiff = now.getMonth() - date.getMonth();
      const dayDiff = now.getDate() - date.getDate();
      
      // Adjust age if birthday hasn't occurred this year
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      return actualAge >= 18 && actualAge <= 100;
    }, {
      message: "Ngày sinh không hợp lệ. Khách hàng phải từ 18 đến 100 tuổi và không được là ngày tương lai",
    }),

  cardId: z
    .string()
    .refine((val) => val === "" || /^[0-9]{9}$|^[0-9]{12}$/.test(val), {
      message: "CCCD phải là 9 hoặc 12 số hoặc để trống",
    }),
});
