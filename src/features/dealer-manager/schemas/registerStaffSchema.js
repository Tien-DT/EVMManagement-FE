export const registerStaffSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  fullName: z
    .string()
    .min(3, "Họ tên phải có ít nhất 3 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 ký tự")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\s()-]+$/, "Số điện thoại không hợp lệ"),
  cardId: z
    .string()
    .min(9, "CCCD/CMND phải có ít nhất 9 ký tự")
    .max(12, "CCCD/CMND không được vượt quá 12 ký tự")
    .regex(/^[0-9]+$/, "CCCD/CMND chỉ được chứa số"),
});
