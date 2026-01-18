import LoginForm from "./loginForm";

const Login = () => {
  return (
    <div className="flex h-screen w-full bg-green">
      <div className="flex w-full items-center justify-center md:w-1/2">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
