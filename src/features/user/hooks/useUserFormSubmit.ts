import { useCreateUser, useUpdateUser } from "../api/services/useUserService";
import type { UserFormValues } from "../pages/UserFormPage";
import type { FormType } from "@/types/formType";

interface UseUserFormSubmitParams {
  id: string | undefined;
  formType: FormType;
  onSuccess?: () => void;
}

const buildUserFormData = (values: UserFormValues): FormData => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(values)], { type: "application/json" }),
  );
  return formData;
};

export const useUserFormSubmit = ({
  id,
  formType,
  onSuccess,
}: UseUserFormSubmitParams) => {
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser({
    onSuccess: () => onSuccess?.(),
  });
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser({
    onSuccess: () => onSuccess?.(),
  });

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (data: UserFormValues) => {
    try {
      const payload = buildUserFormData(data);

      if (formType === "create") {
        await createUser({ payload });
        return;
      }

      if (formType === "edit" && id) {
        await updateUser({ id, payload });
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  return { handleSubmit, isLoading };
};
