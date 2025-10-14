import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/loginSchema";

export const useLogin = () => {
  // setup react-hook-form + zod validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // fake submit handler (mock API)
  const onSubmit = async (data) => {
    console.log("✅ Dữ liệu đăng nhập:", data);
    alert("Đăng nhập thành công (mock)!");
  };

  return { form, onSubmit };
};
