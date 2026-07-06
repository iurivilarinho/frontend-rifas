import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileText, Hash, Shuffle, Tag, Trophy } from "lucide-react";

import { StatusBadge } from "@/components/badge/StatusBadge";
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageShell } from "@/components/layout/PageShell";
import { Loading } from "@/components/Loading";
import { Markdown } from "@/components/Markdown";
import { DocumentImage } from "@/components/image/DocumentImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";

import {
  useGetRaffleById,
  useGetRaffleByIdAndBuyer,
} from "../api/services/useRaffleService";
import { NumberBadge } from "../components/NumberBadge";
import { QuotaGrid } from "../components/QuotaGrid";
import { RaffleProgressBar } from "../components/RaffleProgressBar";
import { RandomQuotaPicker } from "../components/RandomQuotaPicker";
import { ReservationDialog } from "../components/ReservationDialog";
import type { QuotaApiDto } from "../api/dtos/raffle";

type SelectionValidation = {
  isValid: boolean;
  message: string | null;
};

const formatBrl = (reais: number) =>
  Number(reais ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

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

export const RafflePage = () => {
  const { raffleId, cpf } = useParams();
  const hasCpf = !!cpf && cpf.trim().length > 0;

  const byIdQuery = useGetRaffleById(raffleId, { enabled: !hasCpf });
  const byBuyerQuery = useGetRaffleByIdAndBuyer(raffleId, cpf, { enabled: hasCpf });

  const dataRifa = hasCpf ? byBuyerQuery.data : byIdQuery.data;
  const isLoadingRifa = hasCpf ? byBuyerQuery.isLoading : byIdQuery.isLoading;

  const minPurchaseShares = useMemo(
    () => Number(dataRifa?.minPurchaseShares ?? 1),
    [dataRifa],
  );
  const maxPurchaseShares = useMemo(
    () => Number(dataRifa?.maxPurchaseShares ?? Infinity),
    [dataRifa],
  );

  const [selectedButtons, setSelectedButtons] = useState<Set<number>>(new Set());
  const [soldButtons, setSoldButtons] = useState<Set<number>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const reserveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataRifa) return;
    const blocked = new Set<number>();
    dataRifa.quotas?.forEach((quota: QuotaApiDto) => {
      if (quota.sold || quota.reservationId != null) blocked.add(quota.number);
    });
    setSoldButtons(blocked);
  }, [dataRifa]);

  const selectionValidation = useMemo(
    () =>
      validateQuotaSelectionCount(
        selectedButtons.size,
        minPurchaseShares,
        maxPurchaseShares,
      ),
    [selectedButtons.size, minPurchaseShares, maxPurchaseShares],
  );

  const handleGeneratedNumbers = (numbers: number[]) => {
    const updated = new Set(numbers);
    setSelectedButtons(updated);
    setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
    // Fecha o fluxo guiado: assim que os números são gerados, leva o comprador
    // direto até o botão "Reservar".
    if (numbers.length > 0) {
      requestAnimationFrame(() => {
        reserveRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleButtonClick = (label: number) => {
    if (soldButtons.has(label)) return;
    setSelectedButtons((prev) => {
      const updated = new Set(prev);
      if (updated.has(label)) {
        updated.delete(label);
        setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
        return updated;
      }
      const nextCount = updated.size + 1;
      const next = validateQuotaSelectionCount(
        nextCount,
        minPurchaseShares,
        maxPurchaseShares,
      );
      if (!next.isValid && nextCount > maxPurchaseShares) return updated;
      updated.add(label);
      setTotalPrice((dataRifa?.quotaPrice ?? 0) * updated.size);
      return updated;
    });
  };

  if (isLoadingRifa) return <Loading />;
  if (!dataRifa)
    return (
      <PageShell withTopNav={false}>
        <EmptyState
          icon={Tag}
          title="Rifa não encontrada"
          description="Verifique o link ou volte para a lista de rifas."
        />
      </PageShell>
    );

  const porcentagemVendida = Math.max(
    dataRifa.soldPercentage ?? 0,
    dataRifa.standardSalesPercentage ?? 0,
  );
  const soldOut = porcentagemVendida >= 100;
  const showQuotas = hasCpf || dataRifa.showQuotas;

  return (
    <PageShell withTopNav={false} maxWidth="6xl">
      {/* HERO */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={soldOut ? "muted" : "success"}>
            {soldOut ? "Esgotada" : "Vendas abertas"}
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            {porcentagemVendida.toFixed(1)}% vendido
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground">
          {dataRifa.title}
        </h1>
        {dataRifa.description && (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {dataRifa.description}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
        {/* COLUNA ESQUERDA */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Galeria */}
          <SectionCard>
            {dataRifa.images && dataRifa.images.length > 0 ? (
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  {dataRifa.images.map((image) => (
                    <CarouselItem key={image.id} className="basis-full">
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <DocumentImage
                          documentId={image.id}
                          alt={image.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
                Sem imagens cadastradas.
              </div>
            )}
          </SectionCard>

          {/* Gerador aleatório de cotas — largura toda no desktop */}
          {!hasCpf && (
            <SectionCard>
              <SectionCardHeader
                icon={Shuffle}
                title="Sorteie suas cotas"
                hint="Escolha um pacote ou informe a quantidade."
              />
              <div className="px-5 py-4">
                <RandomQuotaPicker
                  onGenerate={handleGeneratedNumbers}
                  numberOfShares={dataRifa.quotas.length}
                  selectedNumbers={soldButtons}
                  minPurchaseShares={minPurchaseShares}
                  maxPurchaseShares={maxPurchaseShares}
                  quotaPrice={dataRifa.quotaPrice}
                />
              </div>
            </SectionCard>
          )}

          {/* Cotas */}
          {showQuotas && (
            <SectionCard>
              <SectionCardHeader
                icon={Hash}
                title={hasCpf ? "Seus números" : "Escolha seus números"}
                hint={
                  hasCpf
                    ? `${selectedButtons.size}/${dataRifa.quotas.length} cota(s)`
                    : `${dataRifa.quotas.length - soldButtons.size} disponíveis`
                }
              />
              <div className="px-5 py-4">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {!hasCpf && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm border border-border bg-card" />
                        Disponível
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm bg-primary" />
                        Selecionada
                      </span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm bg-primary/90" />
                    {hasCpf ? "Suas cotas" : "Reservada / vendida"}
                  </span>
                </div>
                <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-border bg-card p-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                  {dataRifa.quotas.map((cota) => (
                    <NumberBadge
                      key={cota.id}
                      value={cota.number}
                      onClickSelect={
                        hasCpf ? undefined : () => handleButtonClick(cota.number)
                      }
                      selected={selectedButtons.has(cota.number)}
                      sold={cota.sold}
                      reservation={cota.reservationId != null}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* COLUNA DIREITA — PAINEL DE COMPRA (enxuto) */}
        {!hasCpf && (
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <SectionCard>
              <SectionCardHeader icon={Trophy} title="Reserve sua cota" />
              <div className="flex flex-col gap-4 px-5 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Cota a partir de
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatBrl(dataRifa.quotaPrice)}
                  </p>
                </div>

                <RaffleProgressBar
                  porcentagem={porcentagemVendida}
                  label={`${porcentagemVendida.toFixed(0)}% vendido`}
                  showValue={false}
                />

                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Mínimo {minPurchaseShares} · Máximo{" "}
                  {Number.isFinite(maxPurchaseShares) ? maxPurchaseShares : "—"} cotas
                </p>

                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">
                    {selectedButtons.size} cota(s)
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {totalPrice > 0 ? formatBrl(totalPrice) : "—"}
                  </span>
                </div>

                {/* Números gerados aparecem aqui, junto do resumo/Reservar */}
                <QuotaGrid label="Seus números" numbers={selectedButtons} />

                {selectionValidation.message && (
                  <p className="text-xs text-amber-600">{selectionValidation.message}</p>
                )}

                <div ref={reserveRef} className="scroll-mt-24">
                  <ReservationDialog
                    raffleId={dataRifa.id!}
                    disableButton={!selectionValidation.isValid}
                    quotesSelected={selectedButtons}
                    totalPrice={totalPrice}
                    showButtonBuy={!hasCpf}
                  />
                </div>
              </div>
            </SectionCard>
          </aside>
        )}
      </div>

      {/* Descrição / Regulamento — sempre por último, largura inteira */}
      {dataRifa.descriptionAward && (
        <SectionCard className="mt-6">
          <SectionCardHeader icon={FileText} title="Descrição e regulamento" />
          <div className="px-5 py-4">
            <Markdown value={dataRifa.descriptionAward} />
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
};
