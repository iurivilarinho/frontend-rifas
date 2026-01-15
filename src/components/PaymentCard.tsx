import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usePostReservation } from "@/lib/api/tanstackQuery/reservation";
import { Reservation } from "@/types/reserva";
import { Button } from "./button/button";
import InputCopy from "./input/inputCopy";
import { UserFormType } from "@/types/usuario";
import { PagSeguroOrder } from "@/types/pagSeguroOrder";
import { onlyDigits } from "@/utils/formatters";

interface PaymentCardProps {
  totalPrice: number;
  quotesSelected: Set<string>;
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

  const [order, setOrder] = useState<PagSeguroOrder | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

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
      onSuccess: (data: PagSeguroOrder) => {
        setOrder(data);

        const expirationIso = data.qr_codes?.[0]?.expiration_date ?? null;
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

  // contador (atualiza 1x por segundo)
  useEffect(() => {
    if (!order) return;

    const expirationIso = order.qr_codes?.[0]?.expiration_date ?? null;
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

  const qr = order?.qr_codes?.[0] ?? null;

  const qrPngHref = useMemo(() => {
    if (!qr) return null;
    return qr.links.find((l) => l.rel === "QRCODE.PNG")?.href ?? null;
  }, [qr]);

  const pixCopyPaste = qr?.text ?? "";

  const isExpired = timeLeftMs !== null && timeLeftMs <= 0;

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opções de Pagamento</CardTitle>
        <CardDescription>Escolha uma das formas de pagamento</CardDescription>
      </CardHeader>

      <CardContent>
        <p>Confira abaixo as cotas que você está reservando:</p>

        <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-28">
          {Array.from(quotesSelected ?? []).map((number, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded border ml-1 mt-1 w-8"
            >
              <p>{number}</p>
            </div>
          ))}
        </div>

        <p className="my-5 font-bold">
          Valor total:
          {totalPrice
            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            .replace("R$", "")}
        </p>

        {/* some o botão depois que a cobrança foi gerada */}
        {!order && (
          <div className="mt-4">
            <Button onClick={submitForm} disabled={!userData}>
              Gerar cobrança PIX
            </Button>
          </div>
        )}

        {order && (
          <>
            <div className="mt-6">
              <p className="font-semibold">Tempo para pagar:</p>
              {timeLeftMs === null ? (
                <p>Indisponível</p>
              ) : isExpired ? (
                <p className="text-red-600">Expirado</p>
              ) : (
                <p className="text-lg">{formatMsToMMSS(timeLeftMs)}</p>
              )}
            </div>

            <p className="mt-6">QR code para pagamento:</p>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-3" disabled={!qrPngHref || isExpired}>
                  Visualizar QR code
                </Button>
              </DialogTrigger>

              <DialogContent>
                {qrPngHref ? (
                  <img
                    src={qrPngHref}
                    alt="QR Code PIX"
                    className="w-full h-auto"
                  />
                ) : (
                  <p>QR Code indisponível.</p>
                )}
              </DialogContent>
            </Dialog>

            <div className="mt-6">
              <InputCopy value={pixCopyPaste} />
            </div>

            {isExpired && (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setOrder(null);
                    setTimeLeftMs(null);
                  }}
                >
                  Gerar nova cobrança
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="w-full flex justify-center p-2">
        <div className="flex items-center justify-center p-2 rounded">
          <a
            href="https://wa.me/+5534996444008"
            target="_blank"
            rel="noopener noreferrer"
            className="items-center rounded px-4 py-1"
          >
            <Button disabled={!order || isExpired} onClick={() => {}}>
              Enviar comprovante de pagamento
            </Button>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
