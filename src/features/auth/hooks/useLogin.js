import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/loginSchema";
import { authService } from "../services/authService";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // setup react-hook-form + zod validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // API submit handler
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔐 Login data:", data);
      
      // Call API with the exact structure you provided
      const response = await authService.login({
        email: data.email,
        password: data.password
      });
      
      console.log("✅ Login successful:", response);
      
      // Store token if provided
      if (response.token) {
        localStorage.setItem("accessToken", response.token);
      }
      
      // Store user data if provided
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      // Navigate to dashboard or home
      navigate("/dashboard");
      
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
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
