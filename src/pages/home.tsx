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
import {
  HeartHandshake,
  ShieldCheck,
  Ticket,
  Menu,
  NotebookPen,
  Settings,
  UserRoundCheck,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import logo from "@/img/logo.png";

const Home = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
                    <img
                      src={logo}
                      alt="Golden Ticket"
                      className="w-36 h-auto"
                    />
                  </SheetTitle>
                  <SheetDescription>
                    Sorteios beneficentes com transparência: você participa, a
                    causa recebe, e todo mundo acompanha.
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
                      onSelect={() => scrollTo("transparencia")}
                    >
                      <ShieldCheck />
                      <p>Transparência</p>
                    </CommandItem>

                    <CommandItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={() => scrollTo("beneficente")}
                    >
                      <HeartHandshake />
                      <p>Impacto beneficente</p>
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
            <img src={logo} alt="Golden Ticket" className="w-16 h-auto" />
            <div className="leading-tight">
              <p className="font-semibold">Golden Ticket</p>
              <p className="text-xs text-white/90">Sorteios beneficentes</p>
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
              onClick={() => scrollTo("transparencia")}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Transparência</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("beneficente")}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Impacto</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => scrollTo("funcionalidades")}
            >
              <Settings className="h-4 w-4" />
              <span>Funcionalidades</span>
            </button>

            <Button variant="outline" onClick={() => scrollTo("login")}>
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
                Participação simples. Impacto real.
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Golden Ticket: sorteios beneficentes com transparência do início
              ao fim
            </h1>

            <p className="text-gray-700 leading-relaxed">
              Realizamos sorteios para apoiar causas e instituições. Você compra
              suas cotas, acompanha tudo com clareza e ajuda a transformar
              contribuições em resultados.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => scrollTo("conta")} className="h-12">
                <NotebookPen className="mr-2 h-4 w-4" />
                Criar conta
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollTo("como-funciona")}
                className="h-12"
              >
                <Ticket className="mr-2 h-4 w-4" />
                Ver como funciona
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-700" />
                <span>Regras e resultados publicados</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-700" />
                <span>Processo auditável</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              O que você encontra aqui
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <Ticket className="h-5 w-5 text-green-700" />
                <span>
                  Sorteios organizados por campanha, com cotas e prazos.
                </span>
              </li>
              <li className="flex gap-3">
                <HeartHandshake className="h-5 w-5 text-green-700" />
                <span>
                  Campanhas beneficentes com objetivo e destino claros.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-green-700" />
                <span>
                  Transparência: regras, números, status e resultados.
                </span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-900">
                Dica: se você é organizador, use o painel para publicar regras,
                acompanhar vendas e registrar o resultado do sorteio.
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
                <Ticket className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  1) Escolha a campanha
                </h3>
              </div>
              <p className="text-gray-700">
                Veja as campanhas disponíveis, regras, prazos e o objetivo
                beneficente.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <UserRoundCheck className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  2) Participe com cotas
                </h3>
              </div>
              <p className="text-gray-700">
                Selecione suas cotas disponíveis e finalize a participação
                conforme as regras da campanha.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">
                  3) Acompanhe o resultado
                </h3>
              </div>
              <p className="text-gray-700">
                Publicamos status, apurações e resultados. Transparência do
                começo ao fim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparência */}
      <section id="transparencia" className="px-6 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Transparência
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Regras claras
              </h3>
              <p className="text-gray-700">
                Cada campanha deve ter regras, prazos, critério de sorteio e
                forma de divulgação do resultado.
              </p>
            </div>

            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Acompanhamento
              </h3>
              <p className="text-gray-700">
                Status da campanha, cotas disponíveis/selecionadas e publicação
                de resultado ficam acessíveis para consulta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficente */}
      <section id="beneficente" className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sorteios beneficentes (impacto)
          </h2>

          <div className="border rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed">
              A Golden Ticket realiza sorteios com finalidade beneficente. O
              objetivo é conectar participantes a campanhas que apoiam causas e
              instituições, com foco em organização e transparência.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="font-semibold text-green-900">Causa</p>
                <p className="text-sm text-green-900/90">
                  Descrição do objetivo da campanha (ex.: tratamento, projeto
                  social).
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="font-semibold text-green-900">Destino</p>
                <p className="text-sm text-green-900/90">
                  Instituição/beneficiário e como os recursos serão utilizados.
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="font-semibold text-green-900">
                  Prestação de contas
                </p>
                <p className="text-sm text-green-900/90">
                  Publicação de resultado e, quando aplicável,
                  evidências/relatórios.
                </p>
              </div>
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
                Painel de campanhas
              </h3>
              <p className="text-gray-700">
                Criação e gestão de campanhas, regras e publicações.
              </p>
            </div>
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Seleção de cotas
              </h3>
              <p className="text-gray-700">
                Controle de cotas disponíveis e seleção por
                intervalo/individual.
              </p>
            </div>
            <div className="border bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Resultados</h3>
              <p className="text-gray-700">
                Registro e divulgação do resultado do sorteio com histórico.
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
              <h2 className="text-2xl font-semibold">
                Pronto para participar?
              </h2>
              <p className="text-white/90 mt-2">
                Crie sua conta para acompanhar campanhas, selecionar cotas e ver
                resultados.
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
            <img src={logo} alt="Golden Ticket" className="w-12 h-auto" />
            <div>
              <p className="font-semibold text-gray-900">Golden Ticket</p>
              <p className="text-sm text-gray-600">Sorteios beneficentes</p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} Golden Ticket. Todos os direitos
              reservados.
            </p>
            <p className="mt-1">
              Termos • Privacidade • Contato
              {/* Se você já tiver rotas/links, eu amarro aqui */}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
