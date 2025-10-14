import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../schemas/signUpSchema";

export const useSignUp = () => {
  // setup react-hook-form + zod validation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // fake submit handler (mock API)
  const onSubmit = async (data) => {
    console.log("✅ Dữ liệu đăng ký:", data);
    alert("Đăng ký thành công (mock)!");
  };

  return { form, onSubmit };
};
