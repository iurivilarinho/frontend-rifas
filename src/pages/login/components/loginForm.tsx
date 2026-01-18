import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { usePostLogin } from "@/lib/api/tanstackQuery/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // valida no blur; pode mudar para "onChange" se quiser
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const {
    mutate: authenticateUser,
    data: userData,
    isPending: isAuthenticationPending,
    isSuccess: isAuthenticationSuccess,
  } = usePostLogin();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const onSubmit = (data: LoginFormValues) => {
    authenticateUser(data);
  };

  useEffect(() => {
    if (isAuthenticationSuccess && userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/");
    }
  }, [isAuthenticationSuccess, userData, navigate]);

  if (isAuthenticationPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-lg flex-col gap-6 p-6 bg-white rounded-lg"
      noValidate
    >
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="tracking-tigh text-2xl font-semibold text-foreground">
            Bem-vindo!
          </h1>
        </div>
        <p className="text-center text-sm font-normal text-muted-foreground">
          Digite seu login e senha para acessar o painel fiscal.
        </p>
      </div>

      <Input
        label="Login"
        {...register("login")}
        // Exemplo de uso explícito do setValue (padrão de mercado: RHF controla o form)
        onChange={(e) => {
          setValue("login", e.target.value, { shouldDirty: true });
        }}
        onBlur={async () => {
          await trigger("login");
        }}
        notification={{
          isError: Boolean(errors.login?.message),
          notification: errors.login?.message ?? "",
        }}
      />

      <div className="relative">
        <Input
          label="Senha"
          type={isPasswordVisible ? "text" : "password"}
          {...register("password")}
          onChange={(e) => {
            setValue("password", e.target.value, { shouldDirty: true });
          }}
          onBlur={async () => {
            await trigger("password");
          }}
          notification={{
            isError: Boolean(errors.password?.message),
            notification: errors.password?.message ?? "",
          }}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 px-3 py-2 text-sm"
        >
          {isPasswordVisible ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <div className="flex justify-end">
        <Link
          to="/recuperar-senha"
          className="text-sm text-foreground hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" disabled={isSubmitting || isAuthenticationPending}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
