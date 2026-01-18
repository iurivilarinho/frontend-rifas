import { Input } from "@/components/input/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserFormType } from "@/types/usuario";
import { useFormContext } from "react-hook-form";

const BuyerForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserFormType>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes Pessoais</CardTitle>
        <CardDescription>Preencha os dados pessoais abaixo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Input
            label="Nome Completo"
            {...register("fullName")}
            notification={{
              isError: Boolean(errors.fullName),
              notification: errors.fullName?.message ?? "",
            }}
          />
          <Input
            label="CPF"
            {...register("cpf")}
            notification={{
              isError: Boolean(errors.cpf),
              notification: errors.cpf?.message ?? "",
            }}
          />
          <Input
            label="Telefone Celular"
            {...register("numberPhone")}
            notification={{
              isError: Boolean(errors.numberPhone),
              notification: errors.numberPhone?.message ?? "",
            }}
          />
          <Input
            label="Email"
            {...register("email")}
            notification={{
              isError: Boolean(errors.email),
              notification: errors.email?.message ?? "",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerForm;
