import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";
import { authService } from "../services/authService";
import { z } from "zod";

// Schema for OTP verification
const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

// Schema for password reset
const passwordResetSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const useForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const navigate = useNavigate();

  // Form for email step
  const emailForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Form for OTP step
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Form for password reset step
  const passwordForm = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Step 1: Send reset code to email
  const onEmailSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const response = await authService.forgotPassword(data.email);
      setUserEmail(data.email);
      setSuccessMessage(response?.message || "Verification code sent to your email!");
      // Move to OTP step after 1.5 seconds
      setTimeout(() => {
        setStep(2);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (just store it and move to next step)
  const onOtpSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // Store the OTP and move to password reset
      setVerifiedCode(data.otp);
      setSuccessMessage("Code verified! Please set your new password.");
      setTimeout(() => {
        setStep(3);
        setSuccessMessage("");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password with verified code
  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const response = await authService.resetPassword({
        email: userEmail,
        resetToken: verifiedCode,
        newPassword: data.newPassword,
      });
      setSuccessMessage(response?.message || "Password reset successfully!");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to go back to previous step
  const goBack = () => {
    setError(null);
    setSuccessMessage("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Function to resend code
  const resendCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(userEmail);
      setSuccessMessage("New code sent to your email!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    emailForm,
    otpForm,
    passwordForm,
    onEmailSubmit,
    onOtpSubmit,
    onPasswordSubmit,
    isLoading,
    error,
    setError,
    successMessage,
    userEmail,
    goBack,
    resendCode,
  };
};
