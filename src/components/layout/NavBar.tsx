import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import {
  BookSearch,
  LogIn,
  LogOut,
  Share2,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog/Dialog";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { onlyDigits } from "@/utils/formatters";
import { isValidCPF } from "@/utils/validations";
import logo from "@/assets/logo.png";

const cpfSchema = z.object({
  cpf: z.string().refine((value) => isValidCPF(onlyDigits(value)), {
    message: "CPF inválido!",
  }),
});

type CpfFormValues = z.infer<typeof cpfSchema>;

const DEFAULT_CPF_FORM_VALUES: CpfFormValues = { cpf: "" };

export const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CpfFormValues>({
    resolver: zodResolver(cpfSchema),
    defaultValues: DEFAULT_CPF_FORM_VALUES,
  });

  const isRoot = Boolean(matchPath({ path: "/", end: true }, pathname));
  const isPanelRoute = [
    "/panel/*",
    "/raffle/form/*",
    "/user/form/*",
    "/raffle/:raffleId/buyers",
  ].some((path) => Boolean(matchPath({ path, end: false }, pathname)));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Golden Book",
        text: "Confira aqui",
        url: window.location.href,
      });
    }
  };

  const onSubmit = (data: CpfFormValues) => {
    const cpf = onlyDigits(data.cpf);
    navigate(`/raffles/${cpf}`);
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (isRoot) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Golden Book" className="w-12 h-auto" />
          <p className="font-semibold">Golden Book</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle iconOnly className="border-white/20 bg-white/10 text-white hover:bg-white/20" />
          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/login")}
          >
            <LogIn className="h-5 w-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        </div>
      </div>
    );
  }

  if (isPanelRoute) {
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
          <ThemeToggle iconOnly className="border-white/20 bg-white/10 text-white hover:bg-white/20" />
          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 sm:top-0 sm:bottom-auto z-50 bg-green-500 text-white flex justify-around p-4 h-16 pb-[env(safe-area-inset-bottom)]">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button type="button" className="flex flex-col items-center">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">Minhas Compras</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-center"
          >
            <Field>
              <FieldLabel htmlFor="cpf">Informe o CPF usado na compra:</FieldLabel>
              <Input id="cpf" {...register("cpf")} aria-invalid={Boolean(errors.cpf)} />
              {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
            </Field>
            <Button type="submit" className="mt-3">
              Confirmar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        className="flex flex-col items-center"
        onClick={() => navigate("/raffles")}
      >
        <BookSearch className="h-6 w-6" />
        <span className="text-xs">Descobrir</span>
      </button>

      <button type="button" className="flex flex-col items-center" onClick={handleShare}>
        <Share2 className="h-6 w-6" />
        <span className="text-xs">Compartilhar</span>
      </button>
    </div>
  );
};
