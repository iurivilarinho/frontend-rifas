import { Button } from "@/components/button/button";
import { Field, FieldError, FieldLabel } from "@/components/input/Field";
import { Input } from "@/components/input/Input";
import { usePostLogin } from "@/lib/api/tanstackQuery/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, BadgeCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  login: z.string().trim().min(1, "Insira seu login"),
  password: z.string().min(1, "Insira sua senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const headerMeta = useMemo(
    () => ({
      title: "Bem-vindo!",
      subtitle: "Digite seu login e senha para acessar o Golden Ticket.",
      icon: BadgeCheck,
    }),
    [],
  );

  const Icon = headerMeta.icon;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const { mutate: authenticateUser, isPending: isAuthenticationPending } =
    usePostLogin();

  const onSubmit = (data: LoginFormValues) => {
    authenticateUser(data, {
      onSuccess: (userData) => {
        try {
          localStorage.setItem("user", JSON.stringify(userData));
        } catch {
          // fallback mínimo, evita quebrar o fluxo
          localStorage.setItem("user", String(userData));
        }
        navigate("/painel", { replace: true });
      },
      onError: (err) => {
        console.error("Falha no login:", err);
      },
    });
  };

  if (isAuthenticationPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-xl border border-green-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-green-200 bg-green-50 p-2">
                <Icon className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {headerMeta.title}
                </h1>
                <p className="text-sm text-gray-600">{headerMeta.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-white p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <Field>
              <FieldLabel htmlFor="login">Login</FieldLabel>
              <Input
                id="login"
                {...register("login")}
                aria-invalid={Boolean(errors.login)}
              />
              {errors.login?.message && (
                <FieldError>{errors.login.message}</FieldError>
              )}
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
                  className="absolute inset-y-0 right-0 px-3 py-2 text-sm"
                  aria-label={
                    isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  {isPasswordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>

              {errors.password?.message && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>

            <div className="flex justify-end">
              <Link
                to="/recuperar-senha"
                className="text-sm text-foreground hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isAuthenticationPending}
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
