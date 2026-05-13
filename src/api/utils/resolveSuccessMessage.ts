interface ResolveSuccessMessageParams<TData, TVariables> {
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  data: TData;
  variables: TVariables;
  defaultMessage: string;
}

export const resolveSuccessMessage = <TData, TVariables>({
  successMessage,
  data,
  variables,
  defaultMessage,
}: ResolveSuccessMessageParams<TData, TVariables>): string => {
  if (typeof successMessage === "function") {
    return successMessage(data, variables);
  }
  if (typeof successMessage === "string" && successMessage.length > 0) {
    return successMessage;
  }
  return defaultMessage;
};
