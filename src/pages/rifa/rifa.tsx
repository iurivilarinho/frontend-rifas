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
import { Pessoa } from "@/types/pessoa";
import { Rifa } from "@/types/rifa";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BarraPorgresso from "../pessoa/components/barraProgresso";

const RifaPage = () => {
  const { rifaId } = useParams();

  const { data: dataRifa, isLoading: isLoadingRifa } = useGetRifaById(
    rifaId ?? ""
  );

  useEffect(() => {}, [isLoadingRifa]);

  // Estado para gerenciar a seleção dos botões
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(
    new Set()
  );

  const [soldButtons, setSoldButtons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dataRifa) {
      const soldNumbers: Set<string> = new Set();
      (dataRifa as Rifa)?.quotas?.forEach((cota: Cota) => {
        if (cota.sold) {
          soldNumbers.add(String(cota.number));
        }
        setSoldButtons(soldNumbers);
      });
    }
  }, [dataRifa]);

  const [totalPrice, setTotalPrice] = useState(0);

  // esta errado, pegar do usuario criador da rifa, localstorage tem que ser o comprador
  const userString = localStorage.getItem("user");
  const user: Pessoa | null = userString ? JSON.parse(userString) : null;

  const handleGeneratedNumbers = (numbers: number[]) => {
    const updated = new Set(numbers.map(String));
    console.log(updated);
    setSelectedButtons(updated);
    setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
  };

  // Função para alternar a seleção dos botões
  const handleButtonClick = (label: string) => {
    setSelectedButtons((prev) => {
      const updated = new Set(prev);
      if (updated.has(label)) {
        updated.delete(label); // Desmarcar se já estiver selecionado
      } else {
        updated.add(label); // Marcar se não estiver selecionado
      }
      setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
      return updated;
    });
  };
  const totalCotas = dataRifa?.cotas?.length ? dataRifa.cotas.length : 0;
  const cotasVendidas = dataRifa?.cotas?.length
    ? dataRifa.cotas.filter((cota: Cota) => cota.sold).length
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
            <CardDescription>{dataRifa?.descriptionAward}</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel opts={{ loop: true }}>
              <CarouselContent>
                {dataRifa?.images?.map(
                  (foto: { id: number; name?: string }) => (
                    <CarouselItem key={foto.id} className="basis-full">
                      <DisplayImage documentId={foto.id} alt={foto.name} />
                    </CarouselItem>
                  )
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
            <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-60 w-full bg-slate-100">
              <p
                dangerouslySetInnerHTML={{
                  __html: dataRifa.description.replace(/\n/g, "<br />"),
                }}
              />
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
                max={dataRifa?.cotas.length}
                onGenerate={handleGeneratedNumbers}
                selectedNumbers={soldButtons}
              />
              <p className="mt-5 mx-2">ou</p>
              <DialogRandom
                onGenerate={handleGeneratedNumbers}
                numberOfShares={dataRifa?.cotas.length}
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
          {dataRifa?.cotas.map((cota: Cota) => (
            <ButtonRifa
              key={cota.id}
              label={cota.number}
              onClickSelect={() => handleButtonClick(String(cota.number))}
              selected={selectedButtons.has(String(cota.number))}
              sold={cota.sold}
              userPurchase={cota.userPurchaseId === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RifaPage;
