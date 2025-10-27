// src/features/dealer-manager/schemas/timeSlotSchema.js
import { z } from "zod";

export const timeSlotSchema = z.object({
  code: z
    .string()
    .min(1, "Tên slot không được để trống")
    .max(50, "Tên slot không được vượt quá 50 ký tự"),
  
  startHour: z
    .number()
    .min(0, "Giờ bắt đầu phải từ 0-23")
    .max(23, "Giờ bắt đầu phải từ 0-23"),
  
  startMinute: z
    .number()
    .min(0, "Phút bắt đầu phải từ 0-59")
    .max(59, "Phút bắt đầu phải từ 0-59"),
  
  endHour: z
    .number()
    .min(0, "Giờ kết thúc phải từ 0-23")
    .max(23, "Giờ kết thúc phải từ 0-23"),
  
  endMinute: z
    .number()
    .min(0, "Phút kết thúc phải từ 0-59")
    .max(59, "Phút kết thúc phải từ 0-59"),
  
  isActive: z.boolean(),
}).refine(
  (data) => {
    const startTotalMinutes = data.startHour * 60 + data.startMinute;
    const endTotalMinutes = data.endHour * 60 + data.endMinute;
    return endTotalMinutes > startTotalMinutes;
  },
  {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endHour"],
  }
);