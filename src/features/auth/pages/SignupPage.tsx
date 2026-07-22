import { BadgeCheck } from "lucide-react";
import cover from "@/assets/cover.png";
import { SignupForm } from "../components/SignupForm";

export const SignupPage = () => {
  return (
    <div className="fixed inset-0 overflow-auto min-h-screen min-h-[100dvh]">
      <img
        src={cover}
        alt="Golden Book"
        className="fixed inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 [background:radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.8)_100%)]" />

      <div className="relative z-10 flex min-h-full w-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="rounded-xl border border-border bg-card/90 p-6 text-card-foreground shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Crie sua conta
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cadastre-se para criar e gerenciar as suas próprias rifas no
                  Golden Book.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/90 p-6 text-card-foreground shadow-lg backdrop-blur">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
};
