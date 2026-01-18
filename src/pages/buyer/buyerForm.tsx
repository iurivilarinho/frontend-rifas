import { Input } from "@/components/input/Input";
import { Field, FieldError, FieldLabel } from "@/components/input/Field";
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
          <Field>
            <FieldLabel htmlFor="fullName">Nome Completo</FieldLabel>
            <Input
              id="fullName"
              className="w-full"
              {...register("fullName")}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName?.message && (
              <FieldError>{errors.fullName.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Input
              id="cpf"
              className="w-full"
              {...register("cpf")}
              aria-invalid={Boolean(errors.cpf)}
            />
            {errors.cpf?.message && (
              <FieldError>{errors.cpf.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="numberPhone">Telefone Celular</FieldLabel>
            <Input
              id="numberPhone"
              className="w-full"
              {...register("numberPhone")}
              aria-invalid={Boolean(errors.numberPhone)}
            />
            {errors.numberPhone?.message && (
              <FieldError>{errors.numberPhone.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              className="w-full"
              type="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email?.message && (
              <FieldError>{errors.email.message}</FieldError>
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerForm;
