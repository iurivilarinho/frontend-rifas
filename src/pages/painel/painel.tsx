// src/pages/painel/index.tsx
import { useState } from "react";
import logo from "@/img/logo.png";
import { Menu, Ticket, Users } from "lucide-react";

import { Button } from "@/components/button/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import RifasSection from "./module/raffleModule";
import UsuariosSection from "./module/userModule";

type MenuKey = "rifas" | "usuarios";

const Painel = () => {
  const [menu, setMenu] = useState<MenuKey>("rifas");

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar fixa */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white flex justify-between p-4 h-16 sm:justify-around">
        {/* Mobile */}
        <div className="sm:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent
              side={"left"}
              className="flex flex-col justify-between"
            >
              <div>
                <SheetHeader className="mb-8">
                  <SheetTitle className="flex justify-center items-center">
                    <img
                      src={logo}
                      alt="Golden Ticket"
                      className="w-36 h-auto"
                    />
                  </SheetTitle>
                  <SheetDescription>Painel</SheetDescription>
                </SheetHeader>

                <Command className="h-auto">
                  <CommandList>
                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => setMenu("rifas")}
                    >
                      <Ticket />
                      <p>Rifas</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => setMenu("usuarios")}
                    >
                      <Users />
                      <p>Usuários</p>
                    </CommandItem>
                  </CommandList>
                </Command>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex flex-row items-center justify-between w-full max-w-6xl">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Golden Ticket" className="w-16 h-auto" />
            <div className="leading-tight">
              <p className="font-semibold">Golden Ticket</p>
              <p className="text-xs text-white/90">Painel</p>
            </div>
          </div>

          <div className="flex flex-row gap-8 items-center">
            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => setMenu("rifas")}
            >
              <Ticket className="h-4 w-4" />
              <span>Rifas</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => setMenu("usuarios")}
            >
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {menu === "rifas" && <RifasSection />}
        {menu === "usuarios" && <UsuariosSection />}
      </div>
    </div>
  );
};

export default Painel;
