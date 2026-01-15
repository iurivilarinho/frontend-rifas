import Loading from "@/components/loading";
import RifaThumb from "@/components/rifasThumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetRifa, useGetRifaByCpf } from "@/lib/api/tanstackQuery/rifa";
import { Rifa } from "@/types/rifa";
import { useNavigate, useParams } from "react-router-dom";

const RifaList = () => {
  const { cpf } = useParams();
  const navigate = useNavigate();

  const {
    data: allRifas,
    isLoading: isLoadingRifas,
    error: errorRifas,
  } = useGetRifa();

  const {
    data: rifasByCpf,
    isLoading: isLoadingCpf,
    error: errorCpf,
  } = useGetRifaByCpf(cpf ?? "", {
    enabled: Boolean(cpf),
  });

  const handleOnClickCard = (id: number | undefined) => {
    navigate(`/rifa/${id}`);
  };

  if (errorRifas || errorCpf)
    return (
      <div>
        Erro ao carregar dados: {errorRifas?.message || errorCpf?.message}
      </div>
    );

  const rifas = cpf ? rifasByCpf : allRifas;

  if (isLoadingRifas || isLoadingCpf) {
    return <Loading />;
  }

  if (!rifas || rifas.length === 0) {
    return <div>Nenhuma rifa encontrada</div>;
  }

  return (
    <div>
      {rifas.map((rifa: Rifa) => {
        const porcentagemVendida = rifa.soldPercentage;

        return (
          <div className="relative my-3" key={rifa.id}>
            <Card
              onClick={() => handleOnClickCard(rifa.id)}
              className="relative overflow-hidden flex items-center h-28"
            >
              {/* Imagem na esquerda */}
              <div className="w-28 h-full bg-black/40">
                <RifaThumb
                  documentId={rifa.cover.id} // aqui é o ID do documento
                  alt={rifa.cover.name ?? "Imagem não disponível"}
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
                    <CardTitle className="truncate">{rifa.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative text-sm truncate"></CardContent>
                  <CardFooter className="relative flex justify-between text-xs">
                    <p>Preço da Cota: {rifa.quotaPrice}</p>
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

export default RifaList;
