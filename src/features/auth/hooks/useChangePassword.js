import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../schemas/changePasswordSchema";
import { authService } from "../services/authService";

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { confirmNewPassword, ...payload } = data;
      const res = await authService.changePassword(payload);
      setSuccess(res?.message || "Password changed successfully.");
      form.reset();
    } catch (err) {
      setError(err?.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading, error, success, setError, setSuccess };
};
