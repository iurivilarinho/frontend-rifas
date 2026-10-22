import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { PasswordInput } from "@/components/input/PasswordInput";
import { TurnstileWidget, useTurnstile } from "@/components/turnstile";
import { loadTurnstileConfig } from "../api/services/loadTurnstileConfig";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { isValidCPF } from "@/utils/validations";
import { maskCPF, maskPhoneBR, onlyDigits } from "@/utils/formatters";
import { useLogin, useRegisterClient } from "../api/services/useAuthService";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome"),
    email: z.string().trim().email("E-mail inválido"),
    cpf: z.string().refine((value) => isValidCPF(value), "CPF inválido"),
    personalPhone: z.string().optional(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const DEFAULT_SIGNUP_FORM_VALUES: SignupFormValues = {
  name: "",
  email: "",
  cpf: "",
  personalPhone: "",
  password: "",
  confirmPassword: "",
};

const sanitizeRedirect = (value: string | null): string => {
  if (!value) return "/panel";
  // Aceita apenas paths internos (evita open-redirect).
  if (!value.startsWith("/") || value.startsWith("//")) return "/panel";
  return value;
};

export const SignupForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const turnstile = useTurnstile(loadTurnstileConfig);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: DEFAULT_SIGNUP_FORM_VALUES,
  });

  // Cadastro e login não exibem toast próprio — o fluxo controla a mensagem única.
  const { mutateAsync: registerClient, isPending: isSaving } = useRegisterClient(
    { showToast: false },
  );
  const { mutateAsync: login } = useLogin({ showToast: false });

  const redirectParam = params.get("redirect");
  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : "/login";

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await registerClient({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        cpf: onlyDigits(data.cpf),
        personalPhone: data.personalPhone
          ? onlyDigits(data.personalPhone)
          : undefined,
        turnstileToken: turnstile.token,
      });

      // A token works once: the automatic login needs a fresh one.
      const freshToken = await turnstile.renew();
      const user = await login({
        login: data.email.trim().toLowerCase(),
        password: data.password,
        turnstileToken: freshToken,
      });

      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch {
        // ignore storage errors
      }
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Cadastro realizado com sucesso!");
      navigate(sanitizeRedirect(redirectParam), { replace: true });
    } catch (error) {
      turnstile.reset();
      toast.error(
        resolveErrorMessage({
          error: error as Error,
          fallbackMessage: "Erro ao criar conta",
        }),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field>
        <FieldLabel htmlFor="name">Nome completo</FieldLabel>
        <Input id="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="cpf">CPF</FieldLabel>
        <Input
          id="cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={watch("cpf")}
          onChange={(event) =>
            setValue("cpf", maskCPF(event.target.value), {
              shouldValidate: true,
            })
          }
          aria-invalid={Boolean(errors.cpf)}
        />
        {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="personalPhone">Telefone (opcional)</FieldLabel>
        <Input
          id="personalPhone"
          inputMode="tel"
          placeholder="(11) 99999-9999"
          value={watch("personalPhone") ?? ""}
          onChange={(event) =>
            setValue("personalPhone", maskPhoneBR(event.target.value), {
              shouldValidate: true,
            })
          }
          aria-invalid={Boolean(errors.personalPhone)}
        />
        {errors.personalPhone && (
          <FieldError>{errors.personalPhone.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <FieldError>{errors.password.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword")}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <FieldError>{errors.confirmPassword.message}</FieldError>
        )}
      </Field>

      {turnstile.enabled && <TurnstileWidget {...turnstile.widgetProps} />}

      <Button
        type="submit"
        disabled={isSaving || !turnstile.ready}
        className="w-full"
      >
        {isSaving ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to={loginHref} className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
};
