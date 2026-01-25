import { Button } from "@/components/button/button";
import { Command, CommandItem, CommandList } from "@/components/ui/Command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import {
  ShieldCheck,
  Ticket,
  Menu,
  NotebookPen,
  Settings,
  UserRoundCheck,
  Sparkles,
  BadgeCheck,
  BookOpen,
  Download,
  Gift,
} from "lucide-react";
import logo from "@/img/logo.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white flex justify-between p-4 h-16 sm:justify-around">
        {/* Mobile menu */}
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
                    <img src={logo} alt="Golden Book" className="w-36 h-auto" />
                  </SheetTitle>
                  <SheetDescription>
                    Ebooks práticos + acesso imediato. Ao comprar, você recebe
                    números vinculados ao seu pedido para participar de
                    campanhas de prêmios.
                  </SheetDescription>
                </SheetHeader>

                <Command className="h-auto">
                  <CommandList>
                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("como-funciona")}
                    >
                      <Ticket />
                      <p>Como funciona</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("ebooks")}
                    >
                      <BookOpen />
                      <p>Ebooks</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("seguranca")}
                    >
                      <ShieldCheck />
                      <p>Segurança</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("conta")}
                    >
                      <NotebookPen />
                      <p>Criar conta</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("login")}
                    >
                      <UserRoundCheck />
                      <p>Entrar</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("funcionalidades")}
                    >
                      <Settings />
                      <p>Funcionalidades</p>
                    </CommandItem>
                  </CommandList>
                </Command>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navbar */}
        <div className="hidden sm:flex flex-row items-center justify-between w-full max-w-6xl">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Golden Book" className="w-16 h-auto" />
            <div className="leading-tight">
              <p className="font-semibold">Golden Book</p>
              <p className="text-xs text-white/90">
                Ebooks com acesso imediato
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-8 items-center">
            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("como-funciona")}
            >
              <Ticket className="h-4 w-4" />
              <span>Como funciona</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("ebooks")}
            >
              <BookOpen className="h-4 w-4" />
              <span>Ebooks</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("seguranca")}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Segurança</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("funcionalidades")}
            >
              <Settings className="h-4 w-4" />
              <span>Funcionalidades</span>
            </button>

            <Button
              variant="outline"
              onClick={() => {
                navigate("/login");
              }}
            >
              <UserRoundCheck className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Hero */}
      <section className="px-6 py-14 sm:py-20 bg-green-50">
        <div className="max-w-6xl mx-auto grid gap-10 sm:grid-cols-2 items-center">
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-3 py-1 w-fit">
              <Sparkles className="h-4 w-4 text-green-700" />
              <span className="text-sm text-green-800">
                Conteúdo útil + bônus em campanhas de prêmios
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Ebooks que você usa de verdade — e ainda participa de campanhas
              especiais
            </h1>

            <p className="text-gray-700 leading-relaxed">
              Aqui você encontra ebooks digitais com acesso imediato. Ao
              finalizar a compra, seu pedido gera números vinculados ao seu
              cadastro — eles entram nas campanhas de prêmios ativas, conforme
              regras e datas publicadas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => scrollTo("ebooks")} className="h-12">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver ebooks
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollTo("como-funciona")}
                className="h-12"
              >
                <Ticket className="mr-2 h-4 w-4" />
                Entender a dinâmica
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-green-700" />
                <span>Entrega digital imediata</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-700" />
                <span>Regras e datas publicadas</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              O que você encontra aqui
            </h2>

            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <BookOpen className="h-5 w-5 text-green-700" />
                <span>
                  Ebooks em categorias práticas: aprendizado, produtividade e
                  guias.
                </span>
              </li>
              <li className="flex gap-3">
                <Download className="h-5 w-5 text-green-700" />
                <span>
                  Acesso imediato após a confirmação do pedido, direto na sua
                  conta.
                </span>
              </li>
              <li className="flex gap-3">
                <Gift className="h-5 w-5 text-green-700" />
                <span>
                  Números gerados no pedido para entrar nas campanhas de prêmios
                  ativas.
                </span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-900">
                Você compra pelo conteúdo. Os números são um benefício extra do
                pedido e ficam registrados para consulta quando houver campanha
                em andamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Como funciona
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  1) Escolha seu ebook
                </h3>
              </div>
              <p className="text-gray-700">
                Navegue pelo catálogo e selecione o conteúdo que faz sentido
                para você.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  2) Finalize e receba
                </h3>
              </div>
              <p className="text-gray-700">
                Após a confirmação, o acesso fica disponível na sua conta para
                baixar e usar.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  3) Números do seu pedido
                </h3>
              </div>
              <p className="text-gray-700">
                Seu pedido gera números vinculados ao cadastro. Quando houver
                campanhas ativas, eles entram automaticamente conforme as regras
                publicadas.
              </p>
            </div>
          </div>

          <div className="mt-6 border rounded-xl p-6 bg-gray-50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-700 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Tudo registrado</p>
                <p className="text-gray-700">
                  Você consegue consultar seus pedidos, downloads e os números
                  vinculados, além do status e datas das campanhas quando
                  disponíveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ebooks */}
      <section id="ebooks" className="px-6 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ebooks</h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Guias práticos
              </h3>
              <p className="text-gray-700">
                Conteúdo direto ao ponto, passo a passo, para aplicação
                imediata.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Aprendizado</h3>
              <p className="text-gray-700">
                Materiais para evoluir em temas específicos com exemplos e
                exercícios.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Produtividade
              </h3>
              <p className="text-gray-700">
                Métodos, checklists e rotinas para organizar e ganhar
                consistência.
              </p>
            </div>
          </div>

          <div className="mt-6 p-6 border rounded-xl bg-white">
            <p className="text-gray-700 leading-relaxed">
              O catálogo pode variar ao longo do tempo. Dentro da sua conta você
              encontra histórico de compras e acesso aos downloads.
            </p>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section id="seguranca" className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Segurança
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Compra e acesso
              </h3>
              <p className="text-gray-700">
                Pagamento confirmado, acesso liberado. Seus downloads ficam
                associados ao seu cadastro.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Regras publicadas
              </h3>
              <p className="text-gray-700">
                Quando houver campanha, você visualiza critérios, datas, status
                e a forma de divulgação do resultado, junto dos números do seu
                pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="px-6 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Funcionalidades
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Catálogo de ebooks
              </h3>
              <p className="text-gray-700">
                Navegação por categorias e acesso rápido ao que você comprou.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Área do comprador
              </h3>
              <p className="text-gray-700">
                Histórico de pedidos, downloads disponíveis e dados do seu
                cadastro.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Campanhas de prêmios
              </h3>
              <p className="text-gray-700">
                Consulta de campanhas ativas, regras, datas e números vinculados
                aos pedidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto border rounded-xl p-6 sm:p-10 bg-green-600 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Comece pelo conteúdo</h2>
              <p className="text-white/90 mt-2">
                Crie sua conta para comprar ebooks, acessar downloads e
                acompanhar campanhas quando disponíveis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div id="conta" />
              <Button className="h-12 bg-white text-green-700 hover:bg-white/95">
                <NotebookPen className="mr-2 h-4 w-4" />
                Criar conta
              </Button>
              <div id="login" />
              <Button
                variant="outline"
                className="h-12 border-white text-white hover:bg-white/10"
                onClick={() => {
                  navigate("/login");
                }}
              >
                <UserRoundCheck className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Golden Book" className="w-12 h-auto" />
            <div>
              <p className="font-semibold text-gray-900">Golden Book</p>
              <p className="text-sm text-gray-600">
                Ebooks • Acesso imediato • Campanhas
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} Golden Book. Todos os direitos
              reservados.
            </p>
            <p className="mt-1">Termos • Privacidade • Contato</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
