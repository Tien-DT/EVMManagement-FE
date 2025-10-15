import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { signUpSchema } from "../schemas/signUpSchema";
import { authService } from "../services/authService";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // setup react-hook-form + zod validation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      cardId: "",
      role: "EVM_ADMIN",
      password: "",
    },
  });

  // API submit handler
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("📝 Signup data:", data);
      
      // Call API with the exact structure specified
      const response = await authService.signup({
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
        cardId: data.cardId,
      });
      
      console.log("Signup successful:", response);
      
      // Navigate to admin dashboard or show success - stay in admin
      navigate("/admin/dashboard");
      
    } catch (err) {
      console.error(" Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    form, 
    onSubmit, 
    isLoading, 
    error, 
    setError 
  };
};
