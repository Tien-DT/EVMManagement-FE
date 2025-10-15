import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";
import { authService } from "../services/authService";

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const response = await authService.forgotPassword(data.email);
      // Accept either a message or generic success
      setSuccessMessage(response?.message || "If the email exists, a reset link has been sent.");
    } catch (err) {
      setError(err?.message || "Request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading, error, setError, successMessage };
};


