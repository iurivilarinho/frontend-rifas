export interface MutationOptions<TData = unknown, TVariables = unknown> {
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  showToast?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error) => void;
}
