import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { usePostLogin } from "@/lib/api/tanstackQuery/login";
import useValidation from "@/lib/hooks/useValidation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const { values, handleChange, validateField, validateForm, errors } =
    useValidation(
      {
        login: (value) => (value ? null : "Insira seu login"),
        password: (value) => (value ? null : "Insira sua senha"),
      },
      { login: "", password: "" }
    );

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

  const submitForm = () => {
    if (validateForm()) {
      authenticateUser(values);
    }
  };

  useEffect(() => {
    if (isAuthenticationSuccess && userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/rifa");
    }
  }, [isAuthenticationSuccess, userData]);

  if (isAuthenticationPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 p-6 bg-white rounded-lg">
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
        value={values.login}
        onChange={(e) => handleChange("login", e.target.value)}
        onBlur={() => validateField("login", values.login)}
        notification={{
          isError: Boolean(errors.login),
          notification: errors.login ?? "",
        }}
      />
      <div className="relative">
        <Input
          label="Senha"
          type={isPasswordVisible ? "text" : "password"}
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={() => validateField("password", values.password)}
          notification={{
            isError: Boolean(errors.password),
            notification: errors.password ?? "",
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
      <Button onClick={submitForm}>Login</Button>
    </div>
  );
};

export default LoginForm;
