import { useNavigate } from "react-router-dom";

import { Button } from "@/components/button/Button";

export const TermsOfUsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        Voltar
      </Button>

      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Termos de Uso
      </h1>
      <p className="mb-6 text-xs text-slate-500">
        Última atualização: 13 de maio de 2026
      </p>

      <p className="mb-4">
        Ao adquirir cotas e utilizar a plataforma, você concorda com os termos abaixo. Caso
        não concorde, não realize compras.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        1. Objeto
      </h2>
      <p>
        A plataforma comercializa e-books digitais com direito de participação em sorteios
        promocionais, mediante a compra de cotas vinculadas a cada campanha.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        2. Cadastro e elegibilidade
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>É necessário ter no mínimo 18 anos.</li>
        <li>Os dados informados devem ser verdadeiros e atualizados.</li>
        <li>É vedado o uso de CPF de terceiros sem autorização.</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        3. Pagamento e confirmação
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>O pagamento é processado por provedor terceiro (Mercado Pago ou PagBank).</li>
        <li>A cota é considerada adquirida após confirmação efetiva do pagamento.</li>
        <li>Reservas não pagas expiram automaticamente após o tempo limite.</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        4. Sorteio
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>
          O sorteio é realizado entre cotas efetivamente pagas, usando gerador
          criptograficamente seguro (SecureRandom).
        </li>
        <li>O seed utilizado no sorteio é registrado e auditável.</li>
        <li>
          A divulgação do resultado ocorrerá pelos canais oficiais informados na campanha.
        </li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        5. Direito de arrependimento (CDC art. 49)
      </h2>
      <p>
        Compras realizadas exclusivamente em ambiente digital permitem desistência em até 7
        dias contados da contratação. O valor pago será reembolsado integralmente. Esse
        direito não se aplica após a realização do sorteio.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        6. Vedações
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>É proibida a revenda de cotas.</li>
        <li>É proibido o uso de meios automatizados (bots) para aquisição em massa.</li>
        <li>É proibido qualquer ato fraudulento ou que viole legislação aplicável.</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        7. Limitação de responsabilidade
      </h2>
      <p>
        Não nos responsabilizamos por falhas externas (provedores de pagamento, conexão do
        usuário) que estejam fora de nosso controle direto.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        8. Foro
      </h2>
      <p>
        Fica eleito o foro do domicílio do consumidor para dirimir eventuais controvérsias,
        nos termos do CDC.
      </p>
    </div>
  );
};
