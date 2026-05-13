import {
  useCreateRaffle,
  useUpdateRaffle,
} from "../api/services/useRaffleService";
import type { RaffleFormValues } from "../pages/RaffleFormPage";
import type { FormType } from "@/types/formType";

interface UseRaffleFormSubmitParams {
  id: string | undefined;
  formType: FormType;
  onSuccess?: () => void;
}

const documentToFile = (doc: { document?: string; contentType?: string; name?: string }): File | null => {
  if (!doc.document) return null;
  const byteString = atob(doc.document);
  const buffer = new ArrayBuffer(byteString.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < byteString.length; i += 1) {
    bytes[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([buffer], { type: doc.contentType ?? "application/octet-stream" });
  return new File([blob], doc.name ?? "file", { type: doc.contentType });
};

const toCents = (value: number | undefined | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  // Math.round trata 5.00 → 500, 0.10 → 10, evitando 9.999... do float.
  return Math.round(Number(value) * 100);
};

const buildRaffleFormData = (values: RaffleFormValues): FormData => {
  const { images, cover, quotaPrice, ...rest } = values;
  const formData = new FormData();

  if (Array.isArray(cover) && cover[0]) {
    const file = cover[0] as File & { document?: string; contentType?: string; name?: string };
    const converted = (file as { document?: string }).document
      ? documentToFile(file as { document?: string; contentType?: string; name?: string })
      : file;
    if (converted) formData.append("cover", converted);
  }

  if (Array.isArray(images)) {
    images.forEach((entry) => {
      const file = entry as File & { document?: string; contentType?: string; name?: string };
      const converted = (file as { document?: string }).document
        ? documentToFile(file as { document?: string; contentType?: string; name?: string })
        : file;
      if (converted) formData.append("images", converted);
    });
  }

  // Backend espera quotaPrice em CENTAVOS (Integer), mas o form trabalha em REAIS.
  const requestPayload = { ...rest, quotaPrice: toCents(quotaPrice) };

  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], { type: "application/json" }),
  );

  return formData;
};

export const useRaffleFormSubmit = ({
  id,
  formType,
  onSuccess,
}: UseRaffleFormSubmitParams) => {
  const { mutateAsync: createRaffle, isPending: isCreating } = useCreateRaffle({
    onSuccess: () => onSuccess?.(),
  });
  const { mutateAsync: updateRaffle, isPending: isUpdating } = useUpdateRaffle({
    onSuccess: () => onSuccess?.(),
  });

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (data: RaffleFormValues) => {
    try {
      const payload = buildRaffleFormData(data);

      if (formType === "create") {
        await createRaffle({ payload });
        return;
      }

      if (formType === "edit" && id) {
        await updateRaffle({ id, payload });
      }
    } catch (error) {
      console.error("Erro ao salvar ação:", error);
    }
  };

  return { handleSubmit, isLoading };
};
