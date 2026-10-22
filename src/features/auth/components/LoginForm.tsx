import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { PasswordInput } from "@/components/input/PasswordInput";
import { TurnstileWidget, useTurnstile } from "@/components/turnstile";
import { loadTurnstileConfig } from "../api/services/loadTurnstileConfig";
import type { AuthenticatedUser } from "../api/dtos/auth";
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
  const turnstile = useTurnstile(loadTurnstileConfig);

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
    let user: AuthenticatedUser;
    try {
      user = await login({ ...data, turnstileToken: turnstile.token });
    } catch {
      // The token works once: ask for a new one before the next try.
      turnstile.reset();
      return;
    }
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
        <PasswordInput
          id="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
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

      {turnstile.enabled && <TurnstileWidget {...turnstile.widgetProps} />}

      <Button
        type="submit"
        disabled={isSaving || !turnstile.ready}
        className="w-full"
      >
        {isSaving ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link
          to={
            params.get("redirect")
              ? `/cadastro?redirect=${encodeURIComponent(params.get("redirect")!)}`
              : "/cadastro"
          }
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
};
