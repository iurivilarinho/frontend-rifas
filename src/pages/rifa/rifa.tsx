import ButtonRifa from "@/components/button/buttonRifa";
import MultiStepForm from "@/components/dialogMultiStep";
import DisplayImage from "@/components/image/ImageDisplay";
import Markdown from "@/components/Markdown";
import Random from "@/components/Random";
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
import {
  useGetRifaById,
  useGetRifaByIdAndBuyerIdentifier,
} from "@/lib/api/tanstackQuery/rifa";
import { Rifa } from "@/types/rifa";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BarraPorgresso from "../../components/barraProgresso";

type SelectionValidation = {
  isValid: boolean;
  message: string | null;
};

const validateQuotaSelectionCount = (
  count: number,
  min: number,
  max: number,
): SelectionValidation => {
  if (count < min) {
    return {
      isValid: false,
      message: `Selecione no mínimo ${min} cota(s) para continuar.`,
    };
  }

  if (count > max) {
    return {
      isValid: false,
      message: `Você pode selecionar no máximo ${max} cota(s).`,
    };
  }

  return { isValid: true, message: null };
};

const RifaPage = () => {
  const { raffleId, cpf } = useParams();

  const hasCpf = !!cpf && cpf.trim().length > 0;

  const { data: dataRifa, isLoading: isLoadingRifa } = hasCpf
    ? useGetRifaByIdAndBuyerIdentifier(raffleId ?? "", cpf!)
    : useGetRifaById(raffleId ?? "");
  useEffect(() => {}, [isLoadingRifa]);

  const minPurchaseShares = useMemo(
    () => Number(dataRifa?.minPurchaseShares ?? 1),
    [dataRifa],
  );
  const maxPurchaseShares = useMemo(
    () => Number(dataRifa?.maxPurchaseShares ?? Infinity),
    [dataRifa],
  );

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

  // UX/Validação (novo)
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const selectionValidation = useMemo(() => {
    return validateQuotaSelectionCount(
      selectedButtons.size,
      minPurchaseShares,
      maxPurchaseShares,
    );
  }, [selectedButtons.size, minPurchaseShares, maxPurchaseShares]);

  useEffect(() => {
    // mantém a mensagem sincronizada conforme o usuário marca/desmarca
    setSelectionError(selectionValidation.message);
  }, [selectionValidation.message]);

  const handleGeneratedNumbers = (numbers: number[]) => {
    const updated = new Set(numbers.map(String));

    // Não mexe nas validações dos dialogs, mas aqui garantimos consistência visual/submit
    const v = validateQuotaSelectionCount(
      updated.size,
      minPurchaseShares,
      maxPurchaseShares,
    );
    setSelectionError(v.message);

    setSelectedButtons(updated);
    setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
  };

  // Função para alternar a seleção dos botões (tabela)
  const handleButtonClick = (label: string) => {
    // bloqueia se estiver vendida (verde ou qualquer vendida)
    if (soldButtons.has(label)) return;

    setSelectedButtons((prev) => {
      const updated = new Set(prev);

      // se vai desmarcar, sempre permite
      if (updated.has(label)) {
        updated.delete(label);
        setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);

        const v = validateQuotaSelectionCount(
          updated.size,
          minPurchaseShares,
          maxPurchaseShares,
        );
        setSelectionError(v.message);

        return updated;
      }

      // se vai marcar, valida máximo antes de efetivar
      const nextCount = updated.size + 1;
      const vNext = validateQuotaSelectionCount(
        nextCount,
        minPurchaseShares,
        maxPurchaseShares,
      );

      // regra prática: bloqueia apenas se estourar o máximo
      if (!vNext.isValid && nextCount > maxPurchaseShares) {
        setSelectionError(vNext.message);
        return updated; // não adiciona
      }

      updated.add(label);
      setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);

      const v = validateQuotaSelectionCount(
        updated.size,
        minPurchaseShares,
        maxPurchaseShares,
      );
      setSelectionError(v.message);

      return updated;
    });
  };

  const porcentagemVendida = dataRifa?.soldPercentage;

  if (isLoadingRifa) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <Card className="w-screen mx-10 mb-10 bg-white rounded-lg shadow-lg">
          <CardContent className="flex justify-center items-center mt-3">
            <p className="w-full text-center text-2xl font-extrabold text-red-600">
              Por Apenas R$ {dataRifa.quotaPrice ?? 0} !
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasCpf && (
        <div className="flex justify-center">
          <Card className="w-screen mx-10 mb-10">
            <CardHeader>
              <CardTitle></CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center">
              <div>
                {/*<DialogInterval
                max={dataRifa?.quotas.length}
                onGenerate={handleGeneratedNumbers}
                selectedNumbers={soldButtons}
                minPurchaseShares={minPurchaseShares}
                maxPurchaseShares={maxPurchaseShares}
              />*/}
                {/* <DialogRandom
                onGenerate={handleGeneratedNumbers}
                numberOfShares={dataRifa?.quotas.length}
                selectedNumbers={soldButtons}
                minPurchaseShares={minPurchaseShares}
                maxPurchaseShares={maxPurchaseShares}
              />*/}
                <Random
                  onGenerate={handleGeneratedNumbers}
                  numberOfShares={dataRifa?.quotas.length}
                  selectedNumbers={soldButtons}
                  minPurchaseShares={minPurchaseShares}
                  maxPurchaseShares={maxPurchaseShares}
                />
              </div>

              {/* Resumo/UX (novo, sem mudar estrutura geral) */}
              <div className="w-full mt-4 rounded-lg border bg-slate-50 p-4">
                <div className="flex flex-wrap items-center  justify-center">
                  <div className="flex items-center gap-2">
                    {/* <span className="text-sm font-semibold text-slate-700">
                    Seleção
                  </span>
                  <span className="text-xs rounded-full bg-white border px-2 py-1 text-slate-700">
                    Mín: {minPurchaseShares}
                  </span>
                  <span className="text-xs rounded-full bg-white border px-2 py-1 text-slate-700">
                    Máx:{" "}
                    {maxPurchaseShares === Infinity ? "∞" : maxPurchaseShares}
                  </span> */}
                  </div>

                  <div
                    className={[
                      "text-xs rounded-full px-3 py-1 border",
                      selectionValidation.isValid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200",
                    ].join(" ")}
                  >
                    {selectionValidation.isValid
                      ? "Ok para continuar"
                      : "Ajuste a seleção"}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-slate-700">
                    Quantidade de Cotas:{" "}
                    <span className="font-semibold">
                      {selectedButtons.size}
                    </span>
                  </p>
                </div>

                {selectionError && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">{selectionError}</p>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-center border-t-2 p-3">
              <p>
                Valor: R${" "}
                {totalPrice
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                  .replace("R$", "")}
              </p>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="flex flex-col items-center">
        <MultiStepForm
          raffleId={dataRifa?.id}
          disableButton={!selectionValidation.isValid}
          quotesSelected={selectedButtons}
          totalPrice={totalPrice}
          showButtonBuy={!hasCpf}
        />
      </div>

      {(hasCpf || dataRifa?.showQuotas) && (
        <div className="mx-10">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Clique nas cotas disponíveis para selecionar.
            </p>
            <p className="text-xs text-slate-500">
              Selecionadas:{" "}
              <span className="font-semibold">{selectedButtons.size}</span>
            </p>
          </div>

          {/* Legenda */}
          <div className="mb-3 rounded-lg border bg-white p-3">
            {hasCpf && (
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Suas compras
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-green-500 border" />
                <span className="text-sm text-slate-700">Vendidas</span>
              </div>

              {!hasCpf && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-blue-500 border" />
                    <span className="text-sm text-slate-700">Selecionadas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-white border border-slate-300" />
                    <span className="text-sm text-slate-700">Disponíveis</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-96 rounded-lg border bg-white p-3">
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
        </div>
      )}
      <div className="flex justify-center">
        <Card className="w-screen mx-10 m-10">
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
    </div>
  );
};

export default RifaPage;
