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
      dealerId: "",
      phone: "",
      cardId: "",
      role: "EVM_ADMIN",
      password: "",
      confirmPassword: "",
    },
  });

  // API submit handler
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("📝 Signup data:", data);
      
      // Prepare data for API (exclude confirmPassword)
      const { confirmPassword, ...apiData } = data;
      
      // Call API with the exact structure you provided
      const response = await authService.signup({
        email: apiData.email,
        fullName: apiData.fullName,
        dealerId: apiData.dealerId,
        phone: apiData.phone,
        cardId: apiData.cardId,
        role: apiData.role
      });
      
      console.log("✅ Signup successful:", response);
      
      // Navigate to login page after successful signup
      navigate("/login");
      
    } catch (err) {
      console.error("❌ Signup error:", err);
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
