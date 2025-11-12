// src/features/evm-staff/schemas/quotationSchema.js
import { z } from "zod";

export const quotationDetailSchema = z.object({
  vehicleVariantId: z.string().min(1, "Vui lòng chọn phiên bản xe"),
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
  customerId: z.string().min(1, "Vui lòng chọn khách hàng").optional().nullable(),
  createdByUserId: z.string().optional(),
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
  promotionId: z.string().uuid("ID khuyến mãi không hợp lệ").optional().nullable(),
  quotationDetails: z
    .array(quotationDetailSchema)
    .min(1, "Phải có ít nhất một chi tiết báo giá"),
});
