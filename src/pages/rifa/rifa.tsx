import ButtonRifa from "@/components/button/buttonRifa";
import DialogInterval from "@/components/dialogInterval";
import MultiStepForm from "@/components/dialogMultiStep";
import DialogRandom from "@/components/dialogRandom";
import DisplayImage from "@/components/image/ImageDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetRifaById } from "@/lib/api/tanstackQuery/rifa";
import { Rifa } from "@/types/rifa";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BarraPorgresso from "../../components/barraProgresso";
import Markdown from "@/components/Markdown";

const RifaPage = () => {
  const { rifaId } = useParams();

  const { data: dataRifa, isLoading: isLoadingRifa } = useGetRifaById(
    rifaId ?? "",
  );

  useEffect(() => {}, [isLoadingRifa]);

  // Estado para gerenciar a seleção dos botões
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(
    new Set(),
  );

  const [soldButtons, setSoldButtons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dataRifa) {
      const soldNumbers: Set<string> = new Set();
      (dataRifa as Rifa)?.quotas?.forEach((quota: Cota) => {
        if (quota.reservationId) {
          soldNumbers.add(String(quota.number));
        }
        setSoldButtons(soldNumbers);
      });
    }
  }, [dataRifa]);

  const [totalPrice, setTotalPrice] = useState(0);

  const handleGeneratedNumbers = (numbers: number[]) => {
    const updated = new Set(numbers.map(String));
    console.log(updated);
    setSelectedButtons(updated);
    setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
  };

  // Função para alternar a seleção dos botões
  const handleButtonClick = (label: string) => {
    // bloqueia se estiver vendida (verde ou qualquer vendida)
    if (soldButtons.has(label)) return;

    setSelectedButtons((prev) => {
      const updated = new Set(prev);

      if (updated.has(label)) updated.delete(label);
      else updated.add(label);

      setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
      return updated;
    });
  };

  const totalCotas = dataRifa?.quotas?.length ? dataRifa.quotas.length : 0;
  const cotasVendidas = dataRifa?.quotas?.length
    ? dataRifa.quotas.filter((cota: Cota) => cota.sold).length
    : 0;
  const porcentagemVendida =
    cotasVendidas === 0 ? 0 : (cotasVendidas / totalCotas) * 100;
  if (isLoadingRifa) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  console.log(dataRifa);
  return (
    <div>
      <div className="flex justify-center">
        <Card className="w-screen mx-10 mb-10">
          <CardHeader>
            <CardTitle>{dataRifa?.title}</CardTitle>
            <CardDescription>{dataRifa?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel opts={{ loop: true }}>
              <CarouselContent>
                {dataRifa?.images?.map(
                  (foto: { id: number; name?: string }) => (
                    <CarouselItem key={foto.id} className="basis-full">
                      <DisplayImage documentId={foto.id} alt={foto.name} />
                    </CarouselItem>
                  ),
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
          <CardFooter>
            <BarraPorgresso
              label={`${porcentagemVendida.toFixed(0)}% vendido`}
              porcentagem={porcentagemVendida}
            />
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="w-screen mx-10 mb-10 bg-white rounded-lg shadow-lg  ">
          <CardContent className="flex justify-center items-center mt-3">
            <p className="w-full text-center text-2xl font-extrabold text-red-600">
              Por Apenas R$ {dataRifa.quotaPrice ?? 0} !
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="w-screen mx-10 mb-10">
          <CardHeader>
            <CardTitle>
              <p>Descrição e Regulamento</p>
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full max-h-60 overflow-y-auto rounded-md bg-slate-100 p-4">
              <Markdown value={dataRifa?.descriptionAward} />
            </div>
          </CardContent>

          <CardFooter></CardFooter>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="w-screen mx-10 mb-10">
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex  flex-col items-center justify-center">
            <div className="flex justify-between w-full">
              <DialogInterval
                max={dataRifa?.quotas.length}
                onGenerate={handleGeneratedNumbers}
                selectedNumbers={soldButtons}
              />
              <p className="mt-5 mx-2">ou</p>
              <DialogRandom
                onGenerate={handleGeneratedNumbers}
                numberOfShares={dataRifa?.quotas.length}
                selectedNumbers={soldButtons}
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center border-t-2">
              <p className=" mt-3">
                Quantidade de Cotas: {selectedButtons.size}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-center border-t-2 p-3">
            <p>
              Valor: R${" "}
              {totalPrice
                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                .replace("R$", "")}
            </p>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col items-center">
        <MultiStepForm
          raffleId={dataRifa?.id}
          disableButton={selectedButtons.size > 0 ? false : true}
          quotesSelected={selectedButtons}
          totalPrice={totalPrice}
        />
      </div>
      {dataRifa?.showQuotas && (
        <div className="grid grid-cols-5 gap-2 mx-10 overflow-y-auto max-h-96">
          {dataRifa?.quotas.map((cota: Cota) => (
            <ButtonRifa
              key={cota.id}
              label={cota.number}
              onClickSelect={() => handleButtonClick(String(cota.number))}
              selected={selectedButtons.has(String(cota.number))}
              sold={cota.sold}
              reservation={cota.reservationId != null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RifaPage;
