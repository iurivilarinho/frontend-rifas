import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./button/button";
import { useState } from "react";
import QRCodeGenerator from "./qrCodeGenerator";
import { usePostReservation } from "@/lib/api/tanstackQuery/reservation";
import { User } from "@/types/user";
import { Reservation } from "@/types/reserva";

interface RandomProps {
  totalPrice: number;
  quotesSelected: Set<string>;
  valueQrCode: string;
  disableButton: boolean;
  raffleId: number;
}

const DialogPayment = ({
  quotesSelected,
  totalPrice,
  disableButton,
  raffleId,
}: RandomProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: postReservation, isPending } = usePostReservation();

  const submitForm = () => {
    // Recupera o usuário do localStorage
    const userString = localStorage.getItem("user");
    if (!userString) {
      console.error("Usuário não encontrado no localStorage");
      return;
    }

    const user = JSON.parse(userString) as User;

    // Cria a lista de IDs das cotas selecionadas
    const quotasId = Array.from(quotesSelected).map(Number);

    // Cria o objeto que será passado, tipado como Reservation
    const reservation: Reservation = {
      quotaIds: quotasId,
      buyer: user,
      raffleId: raffleId,
    };

    // Faz a requisição para a API usando o mutate
    postReservation(reservation, {
      onSuccess: () => {
        // Lida com o sucesso, por exemplo, fechando o dialog
        //setIsOpen(false);
        console.log("Reserva realizada com sucesso!");
      },
      onError: (error) => {
        // Lida com o erro, por exemplo, exibindo uma mensagem ao usuário
        console.error("Erro ao realizar reserva:", error);
      },
    });
  };
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disableButton} className="mb-4 w-32 h-16">
          Reservar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opções de Pagamento</DialogTitle>
          <DialogDescription>
            Escolha uma das formas de pagamento
          </DialogDescription>
        </DialogHeader>
        <p>Confira abaixo as cotas que você está reservando:</p>
        <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-28">
          {Array.from(quotesSelected).map((number, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded border ml-1 mt-1 w-8"
            >
              <p>{number}</p>
            </div>
          ))}
        </div>
        <p>
          Valor total:{" "}
          {totalPrice
            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            .replace("R$", "")}
        </p>
        <p>QR code para pagamento:</p>
        <QRCodeGenerator
          pixkey="+5534996444008" // Chave Pix
          merchant="Your Name" // Nome do destinatário
          city="Your City" // Cidade do destinatário
          amount={totalPrice} // Valor a ser pago
        />
        <DialogFooter className="w-full  flex justify-center p-4">
          <div className="flex items-center justify-center p-2 rounded">
            <a
              href="https://wa.me/+5534996444008"
              target="_blank"
              rel="noopener noreferrer"
              className="items-center rounded px-4 py-2"
            >
              <Button onClick={submitForm}>
                Enviar comprovante de pagamento
              </Button>
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPayment;
