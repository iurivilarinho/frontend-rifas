import { apiClient } from "@/api/clients/apiClient";
import type { TurnstileConfig } from "@/components/turnstile";

/** Reads whether the backend asks for the human check, and the public widget key. */
export const loadTurnstileConfig = async (): Promise<TurnstileConfig> => {
  const { data } = await apiClient.get<TurnstileConfig>("/public/turnstile");
  return data;
};
