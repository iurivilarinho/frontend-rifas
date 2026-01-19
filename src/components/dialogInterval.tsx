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
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "./input/Field";
import { Input } from "./input/Input";

interface IntervalProps {
  onGenerate: (numbers: number[]) => void;
  max: number;
  selectedNumbers: Set<string>;
}

type IntervalFormValues = {
  de: number;
  ate: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const toInt = (raw: string, fallback: number) => {
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
};

const DialogInterval = ({
  max,
  onGenerate,
  selectedNumbers,
}: IntervalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // schema depende de max
  const schema = useMemo(() => {
    return z
      .object({
        de: z
          .number({ message: "Campo obrigatório" })
          .min(1, "Valor deve ser maior ou igual a 1"),
        ate: z
          .number({ message: "Campo obrigatório" })
          .min(1, "Valor deve ser maior ou igual a 1")
          .max(max, `Valor deve ser menor ou igual a ${max}`),
      })
      .superRefine((data, ctx) => {
        if (data.de > data.ate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["de"],
            message: "Valor deve ser menor ou igual ao campo 'Até'",
          });
        }
        if (data.ate < data.de) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["ate"],
            message: "Valor deve ser maior ou igual ao campo 'De'",
          });
        }
      });
  }, [max]);

  const {
    setValue,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<IntervalFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { de: 1, ate: max },
    shouldUnregister: false,
  });

  const formValues = watch();

  const handleChange = (field: keyof IntervalFormValues, value: number) => {
    setValue(field, value, { shouldDirty: true });
  };

  const validateField = async (field: keyof IntervalFormValues) => {
    await trigger(field);
  };

  const validateForm = async () => {
    return await trigger();
  };

  const handleGenerateNumberInterval = async () => {
    const ok = await validateForm();
    if (!ok) return;

    const numbers: number[] = [];
    for (let i = formValues.de; i <= formValues.ate; i++) {
      if (!selectedNumbers.has(String(i))) numbers.push(i);
    }

    onGenerate(numbers);
    setIsOpen(false);
  };

  // atualiza valores quando max muda (equivalente ao seu handleChange no useEffect)
  useEffect(() => {
    reset({ de: 1, ate: max }, { keepDirty: false, keepTouched: false });
  }, [max, reset]);

  const isConfirmDisabled =
    formValues.de < 1 ||
    formValues.ate < 1 ||
    formValues.de > formValues.ate ||
    formValues.ate > max;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 w-32 h-16">Selecionar faixa</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Selecionar cotas entre um intervalo numérico
          </DialogTitle>
          <DialogDescription>
            Informe sobre qual intervalo deseja selecionar.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Field>
            <FieldLabel htmlFor="de">De:</FieldLabel>

            <Input
              id="de"
              type="number"
              name="de"
              value={formValues.de}
              min={1}
              max={formValues.ate}
              aria-invalid={Boolean(errors.de?.message)}
              onChange={(e) => {
                const value = toInt(e.target.value, 1);
                handleChange("de", value);
              }}
              onBlur={async (e) => {
                const raw = toInt(e.target.value, 1);
                const value = clamp(raw, 1, formValues.ate);

                handleChange("de", value);

                // garante consistência (se de > ate, ajusta ate também)
                if (value > formValues.ate) {
                  handleChange("ate", value);
                }

                await validateField("de");
                await validateField("ate");
              }}
            />

            {errors.de?.message && <FieldError>{errors.de.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="ate">Até:</FieldLabel>

            <Input
              id="ate"
              type="number"
              name="ate"
              value={formValues.ate}
              min={formValues.de}
              max={max}
              onChange={(e) => {
                const value = toInt(e.target.value, max);
                handleChange("ate", value);
              }}
              onBlur={async (e) => {
                const raw = toInt(e.target.value, max);
                const value = clamp(raw, formValues.de, max);

                handleChange("ate", value);

                // garante consistência (se ate < de, ajusta de também)
                if (value < formValues.de) {
                  handleChange("de", value);
                }

                await validateField("ate");
                await validateField("de");
              }}
            />

            {errors.ate?.message && (
              <FieldError>{errors.ate.message}</FieldError>
            )}
          </Field>
        </div>

        <DialogFooter className="items-center">
          <Button
            disabled={isConfirmDisabled}
            className="mb-4 w-36 h-16"
            onClick={handleGenerateNumberInterval}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogInterval;
