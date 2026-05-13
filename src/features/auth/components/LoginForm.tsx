import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { useLogin } from "../api/services/useAuthService";

const loginSchema = z.object({
  login: z.string().trim().min(1, "Insira seu login"),
  password: z.string().min(1, "Insira sua senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEFAULT_LOGIN_FORM_VALUES: LoginFormValues = {
  login: "",
  password: "",
};

const sanitizeRedirect = (value: string | null): string => {
  if (!value) return "/panel";
  // Aceita apenas paths internos (evita open-redirect).
  if (!value.startsWith("/") || value.startsWith("//")) return "/panel";
  return value;
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_LOGIN_FORM_VALUES,
  });

  const { mutateAsync: login, isPending: isSaving } = useLogin();

  const onSubmit = async (data: LoginFormValues) => {
    const user = await login(data);
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
    // Invalida o cache do /users/me pra que o ProtectedRoute reconheça o login.
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
    const redirectTo = sanitizeRedirect(params.get("redirect"));
    navigate(redirectTo, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Field>
        <FieldLabel htmlFor="login">Login</FieldLabel>
        <Input
          id="login"
          {...register("login")}
          aria-invalid={Boolean(errors.login)}
        />
        {errors.login && <FieldError>{errors.login.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 py-2 text-sm"
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          >
            {isPasswordVisible ? <Eye /> : <EyeOff />}
          </button>
        </div>
        {errors.password && <FieldError>{errors.password.message}</FieldError>}
      </Field>

      <div className="flex justify-end">
        <Link
          to="/recuperar-senha"
          className="text-sm text-gray-800 hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
