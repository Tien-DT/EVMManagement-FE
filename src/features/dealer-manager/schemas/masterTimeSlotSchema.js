// src/features/dealer-manager/schemas/masterTimeSlotSchema.js
import { z } from "zod";

// Business hours constraints
const MORNING_START = 7 * 60 + 30; // 7h30 = 450 minutes
const MORNING_END = 11 * 60 + 30; // 11h30 = 690 minutes
const AFTERNOON_START = 13 * 60 + 30; // 13h30 = 810 minutes
const AFTERNOON_END = 17 * 60 + 30; // 17h30 = 1050 minutes

export const masterTimeSlotSchema = z
  .object({
    code: z
      .string()
      .min(1, "Tên slot không được để trống")
      .max(50, "Tên slot không được vượt quá 50 ký tự"),

    startOffsetMinutes: z
      .number()
      .min(0, "Start offset phải >= 0")
      .max(1440, "Start offset không được vượt quá 1440 phút (1 ngày)"),

    durationMinutes: z
      .number()
      .min(15, "Thời lượng phải ít nhất 15 phút")
      .max(120, "Thời lượng không được vượt quá 120 phút (2 giờ)"),

    isActive: z.boolean().default(false),

    dealerId: z.string().uuid("Dealer ID phải là UUID hợp lệ"),
  })
  .refine(
    (data) => {
      const { startOffsetMinutes, durationMinutes } = data;
      const endMinutes = startOffsetMinutes + durationMinutes;
      
      // Check if the slot is within business hours
      // Morning: 7h30 - 11h30
      const fitsMorning =
        startOffsetMinutes >= MORNING_START &&
        endMinutes <= MORNING_END;
      
      // Afternoon: 13h30 - 17h30
      const fitsAfternoon =
        startOffsetMinutes >= AFTERNOON_START &&
        endMinutes <= AFTERNOON_END;
      
      // Check if end time doesn't exceed midnight (1440 minutes)
      const withinDay = endMinutes <= 1440;
      
      return (fitsMorning || fitsAfternoon) && withinDay;
    },
    {
      message:
        "Slot phải nằm trong giờ hành chính (7h30-11h30 hoặc 13h30-17h30)",
      path: ["startOffsetMinutes"],
    }
  );
