import { useNavigate } from "react-router-dom";

import { Button } from "@/components/button/Button";

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        Voltar
      </Button>

      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Política de Privacidade
      </h1>
      <p className="mb-6 text-xs text-slate-500">
        Última atualização: 13 de maio de 2026
      </p>

      <p className="mb-4">
        Esta Política de Privacidade descreve como tratamos os dados pessoais coletados em
        nossa plataforma, em conformidade com a Lei Geral de Proteção de Dados Pessoais
        (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        1. Dados que coletamos
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>Nome completo, CPF, e-mail e telefone informados na compra de cotas.</li>
        <li>Dados de pagamento processados exclusivamente pelos provedores (Mercado Pago / PagBank).</li>
        <li>Dados técnicos: endereço IP, identificador de dispositivo, cookies essenciais.</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        2. Finalidades
      </h2>
      <ul className="ml-5 list-disc space-y-1">
        <li>Executar o contrato de compra de cotas e entrega do produto digital.</li>
        <li>Confirmar pagamentos e emitir comprovantes.</li>
        <li>Realizar e auditar sorteios.</li>
        <li>Cumprir obrigações legais, fiscais e regulatórias.</li>
        <li>Enviar comunicações transacionais (confirmação, suporte, resultado do sorteio).</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        3. Bases legais
      </h2>
      <p>
        Tratamos seus dados com base em: execução de contrato (art. 7º, V), cumprimento de
        obrigação legal/regulatória (art. 7º, II) e legítimo interesse para prevenção a
        fraudes (art. 7º, IX).
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        4. Compartilhamento
      </h2>
      <p>
        Compartilhamos dados estritamente necessários com: provedores de pagamento,
        provedores de e-mail transacional, autoridades públicas quando exigido por lei.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        5. Cookies
      </h2>
      <p>
        Usamos cookies estritamente necessários para autenticação, segurança e PWA. Não
        utilizamos cookies de publicidade ou rastreamento de terceiros.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        6. Retenção
      </h2>
      <p>
        Mantemos seus dados pelo prazo necessário para cumprir as finalidades acima e
        prazos legais (mínimo de 5 anos para fins fiscais).
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        7. Seus direitos
      </h2>
      <p>Você tem o direito de:</p>
      <ul className="ml-5 list-disc space-y-1">
        <li>Confirmar a existência de tratamento dos seus dados.</li>
        <li>Acessar/obter cópia dos dados (portabilidade).</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
        <li>Solicitar a anonimização ou eliminação dos dados.</li>
        <li>Revogar consentimentos.</li>
      </ul>
      <p className="mt-3">
        Para exercer esses direitos, envie um e-mail para <strong>contato@goldenbook.local</strong>{" "}
        com cópia do documento de identidade.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        8. Encarregado (DPO)
      </h2>
      <p>
        Contato do Encarregado pelo Tratamento de Dados Pessoais:{" "}
        <strong>dpo@goldenbook.local</strong>.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        9. Alterações
      </h2>
      <p>
        Esta política pode ser atualizada. A versão vigente sempre estará disponível
        nesta página.
      </p>
    </div>
  );
};
