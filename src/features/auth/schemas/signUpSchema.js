import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^\d{10}$/g, "Phone number must be exactly 10 digits"),
    cardId: z
      .string()
      .regex(/^\d{9,12}$/g, "Card ID must be 9 to 12 digits"),
    role: z.enum(["EVM_ADMIN", "EVM_STAFF", "DEALER_MANAGER", "DEALER_STAFF"], {
      errorMap: () => ({ message: "Please select a valid role" })
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  ;
