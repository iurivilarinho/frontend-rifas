import logo from "@/img/logo.png";
import { onlyDigits } from "@/utils/formatters";
import { isValidCPF } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookSearch,
  LogIn,
  LogOut,
  Share2,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import z from "zod";
import { Dialog, DialogContent, DialogTrigger } from "./dialog/Dialog";
import { Field, FieldError, FieldLabel } from "./input/Field";
import { Input } from "./input/Input";
import { Button } from "./button/button";

const cpfSchema = z.object({
  cpf: z.string().refine(isValidCPF, {
    message: "CPF inválido!",
  }),
});

type findCpf = z.infer<typeof cpfSchema>;

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [open, setOpen] = useState<boolean>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<findCpf>({ resolver: zodResolver(cpfSchema) });

  // raiz exata
  const isRoot = Boolean(matchPath({ path: "/", end: true }, pathname));

  // rotas que realmente são do painel (não inclui "/")
  const isPainelRoute = ["/panel/*", "/raffle/form/*", "/user/form/*"].some(
    (path) => Boolean(matchPath({ path, end: false }, pathname)),
  );

  // regra final: painel = (raiz) OU (rotas do painel)
  const isPainel = isRoot || isPainelRoute;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Título da página",
        text: "Texto a ser compartilhado",
        url: window.location.href,
      });
    }
  };

  const handleOnSubmit = (data: findCpf) => {
    const cpf = onlyDigits(data.cpf);
    navigate(`/raffles/${cpf}`);
  };

  const handleAuthAction = () => {
    if (isRoot) {
      navigate("/login");
      return;
    }

    // logout mínimo (ajuste conforme seu auth real)
    localStorage.removeItem("token");
    navigate("/login");
  };

  // === TOPBAR (Painel / Root) ===
  if (isPainel) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Golden Book" className="w-12 h-auto" />
          <div className="leading-tight">
            <p className="font-semibold">Golden Book</p>
            <p className="text-xs text-white/90">Painel</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/panel?tab=raffles")}
          >
            <Ticket className="h-5 w-5" />
            <span className="hidden sm:inline">Ações</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/panel?tab=users")}
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Usuários</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
            onClick={handleAuthAction}
          >
            {isRoot ? (
              <LogIn className="h-5 w-5" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {isRoot ? "Login" : "Logout"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // === BOTTOMBAR (Público) ===
  return (
    <div
      className="
        fixed left-0 right-0 bottom-0
        sm:top-0 sm:bottom-auto
        z-50 bg-green-500 text-white
        flex justify-around p-4 h-16
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="flex flex-col items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <ShoppingCart className="h-6 w-6" />
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col justify-center">
              <Field>
                <FieldLabel>Informe o CPF usado na compra:</FieldLabel>

                <Input {...register("cpf")} />

                {errors.cpf?.message && (
                  <FieldError>{errors.cpf?.message}</FieldError>
                )}
              </Field>

              <Button
                className="mt-3"
                onClick={handleSubmit((data) => {
                  handleOnSubmit(data);
                  setOpen(false);
                })}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <span className="text-xs">Minhas Compras</span>
      </div>
      <div className="flex flex-col items-center">
        <BookSearch onClick={() => navigate("/raffles")} className="h-6 w-6" />
        <span className="text-xs">Descobrir</span>
      </div>
      <div className="flex flex-col items-center">
        <Share2 onClick={handleShare} className="h-6 w-6" />
        <span className="text-xs">Compartilhar</span>
      </div>
    </div>
  );
};

export default NavBar;
