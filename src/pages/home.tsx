import { Button } from "@/components/button/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, NotebookPen, Settings, UserRoundCheck } from "lucide-react"; // Adiciona o ícone de menu e fechar
import logo from "@/img/logo.png";

const Home = () => {
  return (
    <div>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white flex justify-between p-4 h-16 sm:top-0 sm:bottom-auto sm:justify-around">
        {/* Menu Sanduíche para Mobile */}{" "}
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
                <SheetHeader className="mb-10">
                  <SheetTitle className="flex justify-center items-center">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-36 h-auto rotate-12"
                    />
                  </SheetTitle>
                  <SheetDescription>
                    Gerencie suas rifas com facilidade e transparência. O
                    sucesso começa com uma boa organização!
                  </SheetDescription>
                </SheetHeader>
                <Command className="h-auto">
                  {/* <CommandInput placeholder="Search menu..." /> */}
                  <CommandList>
                    <CommandItem className="flex items-center space-x-2">
                      <UserRoundCheck />
                      <p>Login</p>
                    </CommandItem>
                    <CommandItem className="flex items-center space-x-2">
                      <NotebookPen />
                      <p>Cadastre-se</p>
                    </CommandItem>
                    <CommandItem className="flex items-center space-x-2">
                      <Settings />
                      <p>Funcionalidades</p>
                    </CommandItem>
                  </CommandList>
                </Command>
              </div>

              <SheetFooter className="">
                {/* <Button
                  variant={"ghost"}
                  className="flex items-center space-x-2"
                >
                  <LogOut />
                  Logout
                </Button> */}
                {/* <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose> */}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        {/* Links da navbar (escondidos no mobile quando o menu não está aberto) */}
        <div className="hidden sm:flex flex-col sm:flex-row items-center sm:justify-between w-full">
          <img src={logo} alt="Logo" className="w-20 h-auto rotate-12" />
          <div id="items" className="flex flex-row gap-10">
            <div className="flex flex-row items-center sm:mx-4 space-x-2">
              <Settings />
              <p>Funcionalidades</p>
            </div>
            <div className="flex flex-row items-center sm:mx-4 space-x-2">
              <NotebookPen />
              <p>Cadastre-se</p>
            </div>
            <div className="flex flex-row items-center sm:mx-4 space-x-2">
              <UserRoundCheck />
              <p>Login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
