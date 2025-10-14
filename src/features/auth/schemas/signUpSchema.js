import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    dealerId: z.string().uuid("Invalid dealer ID format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    cardId: z.string().min(1, "Card ID is required"),
    role: z.enum(["EVM_ADMIN", "DEALER", "USER"], {
      errorMap: () => ({ message: "Please select a valid role" })
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
