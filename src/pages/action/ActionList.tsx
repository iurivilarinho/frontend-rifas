import Loading from "@/components/Loading";
import ActionThumb from "@/components/ActionThumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useGetRifa, useGetRifaByCpf } from "@/lib/api/tanstackQuery/rifa";
import { useNavigate, useParams } from "react-router-dom";
import { Action } from "@/types/Action";

const ActionList = () => {
  const { cpf } = useParams();
  const hasCpf = !!cpf && cpf.trim().length > 0;

  const navigate = useNavigate();

  const {
    data: allActions,
    isLoading: isLoadingActions,
    error: errorActions,
  } = useGetRifa();

  const {
    data: actionsByCpf,
    isLoading: isLoadingCpf,
    error: errorCpf,
  } = useGetRifaByCpf(cpf ?? "", {
    enabled: Boolean(cpf),
  });

  const handleOnClickCard = (id: number | undefined) => {
    hasCpf ? navigate(`/raffle/${id}/${cpf}`) : navigate(`/raffle/${id}`);
  };

  if (errorActions || errorCpf)
    return (
      <div>
        Erro ao carregar dados: {errorActions?.message || errorCpf?.message}
      </div>
    );

  const actions = cpf ? actionsByCpf : allActions;

  if (isLoadingActions || isLoadingCpf) {
    return <Loading />;
  }

  if (!actions || actions.length === 0) {
    return <div>Nenhuma ação encontrada</div>;
  }

  return (
    <div>
      {actions.map((action: Action) => {
        const porcentagemVendida = action.soldPercentage;

        return (
          <div className="relative my-3" key={action.id}>
            <Card
              onClick={() => handleOnClickCard(action.id)}
              className="relative overflow-hidden flex items-center h-28"
            >
              {/* Imagem na esquerda */}
              <div className="w-28 h-full bg-black/40">
                <ActionThumb
                  documentId={action.cover.id} // aqui é o ID do documento
                  alt={action.cover.name ?? "Imagem não disponível"}
                  className="w-full h-full object-cover rounded-l"
                />
              </div>

              {/* Barra de progresso na direita */}
              <div className="flex-1 relative h-full bg-white">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500"
                  style={{ width: `${porcentagemVendida}%` }}
                ></div>
                <div className="relative overflow-hidden">
                  <CardHeader className="relative">
                    <CardTitle className="truncate">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative text-sm truncate"></CardContent>
                  <CardFooter className="relative flex justify-between text-xs">
                    <p>Preço da Cota: {action.quotaPrice}</p>
                    <p>{porcentagemVendida?.toFixed(2)}% vendido</p>
                  </CardFooter>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default ActionList;
