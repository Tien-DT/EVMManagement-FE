// src/features/evm-staff/schemas/quotationSchema.js
import { z } from "zod";

export const quotationDetailSchema = z.object({
  vehicleVariantId: z.string().uuid("ID mẫu xe không hợp lệ"),
  quantity: z.number().int().positive("Số lượng phải là số nguyên dương"),
  unitPrice: z.number().nonnegative("Đơn giá không được âm"),
  discountPercent: z
    .number()
    .min(0, "Phần trăm giảm giá không được âm")
    .max(100, "Phần trăm giảm giá không được vượt quá 100%"),
  note: z.string().optional(),
});

export const quotationSchema = z.object({
  code: z.string().min(1, "Mã báo giá không được để trống"),
  customerId: z.string().uuid("ID khách hàng không hợp lệ"),
  createdByUserId: z.string().uuid("ID người tạo không hợp lệ"),
  note: z.string().optional(),
  status: z.string().default("DRAFT"),
  validUntil: z
    .string()
    .or(z.date())
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date > now;
    }, "Ngày hết hạn phải sau ngày hiện tại"),
  quotationDetails: z
    .array(quotationDetailSchema)
    .min(1, "Phải có ít nhất một chi tiết báo giá"),
});