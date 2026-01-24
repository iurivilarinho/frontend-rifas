import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { usePostReservation } from "@/lib/api/tanstackQuery/reservation";
import { UserFormType } from "@/pages/buyer/buyerForm";
import { MercadoPagoOrder } from "@/types/MercadoPagoOrder";
import { Reservation } from "@/types/reserva";
import { onlyDigits } from "@/utils/formatters";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./button/button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog/Dialog";
import { Field } from "./input/Field";
import { Input } from "./input/Input";
import QuotaGrid from "./QuotaGrid";
import Loading from "./Loading";

interface PaymentCardProps {
  totalPrice: number;
  quotesSelected: Set<number>;
  raffleId: number;
  userData: UserFormType | null;
}

function formatMsToMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const PaymentCard = ({
  quotesSelected,
  totalPrice,
  raffleId,
  userData,
}: PaymentCardProps) => {
  const { mutate: postReservation, isPending } = usePostReservation();

  const [order, setOrder] = useState<MercadoPagoOrder | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const submitForm = () => {
    if (!userData) {
      console.error("Dados do usuário não disponíveis");
      return;
    }

    const quotaIds = Array.from(quotesSelected ?? []).map(Number);

    if (quotaIds.length === 0) {
      console.error("Nenhuma cota selecionada");
      return;
    }

    const reservation: Reservation = {
      quotaIds,
      buyer: { ...userData, cpf: onlyDigits(userData.cpf) },
      raffleId,
    };

    postReservation(reservation, {
      onSuccess: (data: MercadoPagoOrder) => {
        setOrder(data);

        const expirationIso = data.date_of_expiration ?? null;
        if (expirationIso) {
          const expirationMs = new Date(expirationIso).getTime();
          setTimeLeftMs(Math.max(0, expirationMs - Date.now()));
        } else {
          setTimeLeftMs(null);
        }
      },
      onError: (error) => {
        console.error("Erro ao realizar reserva:", error);
      },
    });
  };

  useEffect(() => {
    if (!order) return;

    const expirationIso = order.date_of_expiration ?? null;
    if (!expirationIso) return;

    const expirationMs = new Date(expirationIso).getTime();

    const tick = () => {
      const diff = Math.max(0, expirationMs - Date.now());
      setTimeLeftMs(diff);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [order]);

  const pixCopyPaste =
    order?.point_of_interaction?.transaction_data?.qr_code ?? "";
  const ticketUrl =
    order?.point_of_interaction?.transaction_data?.ticket_url ?? null;
  const qrBase64 =
    order?.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;

  const isExpired = timeLeftMs !== null && timeLeftMs <= 0;

  const qrImgSrc = useMemo(() => {
    if (!qrBase64) return null;
    if (qrBase64.startsWith("data:image")) return qrBase64;
    return `data:image/png;base64,${qrBase64}`;
  }, [qrBase64]);

  const handleCopy = async () => {
    if (!pixCopyPaste) return;

    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Falha ao copiar código PIX:", e);
    }
  };

  if (isPending) {
    return <Loading />;
  }

  return (
    <Card className="h-full min-h-0 flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>Pagamento</CardTitle>
        <CardDescription>Gere a cobrança e pague via Pix</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto">
        <p className="my-5 font-bold">
          Valor total:
          {totalPrice
            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            .replace("R$", "")}
        </p>

        {!order && (
          <div className="mt-4">
            <Button
              onClick={submitForm}
              disabled={!userData}
              className="w-full"
            >
              Gerar Pix
            </Button>
          </div>
        )}

        {order && (
          <>
            <div className="mt-6 flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Tempo para pagar</p>
                {timeLeftMs === null ? (
                  <p className="text-sm text-muted-foreground">Indisponível</p>
                ) : isExpired ? (
                  <p className="text-sm text-red-600">Expirado</p>
                ) : (
                  <p className="text-lg font-semibold">
                    {formatMsToMMSS(timeLeftMs)}
                  </p>
                )}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={(!!qrImgSrc === false && !ticketUrl) || isExpired}
                    className="shrink-0"
                  >
                    Ver QR Code
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  {qrImgSrc ? (
                    <img
                      src={qrImgSrc}
                      alt="QR Code PIX"
                      className="w-full h-auto"
                    />
                  ) : ticketUrl ? (
                    <div className="space-y-3">
                      <p>Não foi possível carregar a imagem do QR Code.</p>
                      <a
                        href={ticketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Abrir ticket do Mercado Pago
                      </a>
                    </div>
                  ) : (
                    <p>QR Code indisponível.</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-5">
              <Field>
                <div className="relative">
                  <Input
                    value={pixCopyPaste}
                    aria-label="Código Pix copia e cola"
                    readOnly
                    className="w-full pr-24"
                  />

                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div className="relative">
                      {/* Balão */}
                      {copied && (
                        <div className="absolute -top-10 right-0 z-10">
                          <div className="relative rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
                            Copiado
                            {/* setinha */}
                            <div className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 border-b border-r bg-background" />
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleCopy}
                        disabled={!pixCopyPaste || isExpired}
                        className="h-8 px-3"
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                </div>
              </Field>
              <p className="mt-2 text-xs text-muted-foreground">
                Copie o código e cole no app do seu banco para pagar.
              </p>
              {ticketUrl && (
                <div className="mt-3">
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-sm"
                  >
                    Abrir link de pagamento
                  </a>
                </div>
              )}
            </div>

            {isExpired && (
              <div className="mt-5">
                <Button
                  className="w-full"
                  onClick={() => {
                    setOrder(null);
                    setTimeLeftMs(null);
                    setCopied(false);
                  }}
                >
                  Gerar novo Pix
                </Button>
              </div>
            )}
          </>
        )}

        <QuotaGrid
          label="Confira abaixo as seus números para concorrer:"
          numbers={quotesSelected}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
