import { apiClient } from "@/api/clients/apiClient";
import type {
  PushDiagnosticsResponse,
  PushPublicKeyResponse,
  PushSubscriptionPayload,
  PushTestResponse,
  PushTopic,
} from "../dtos/push";

export const getPushPublicKey = async (): Promise<string | null> => {
  const { data } = await apiClient.get<PushPublicKeyResponse>("/push/public-key");
  return data?.publicKey?.trim() ? data.publicKey : null;
};

export const registerPushSubscription = async (
  payload: PushSubscriptionPayload,
): Promise<void> => {
  await apiClient.post("/push/subscriptions", payload);
};

export const removePushSubscription = async (endpoint: string): Promise<void> => {
  await apiClient.delete("/push/subscriptions", { params: { endpoint } });
};

export const removePushSubscriptionTopic = async (
  endpoint: string,
  topic: PushTopic,
): Promise<void> => {
  await apiClient.delete("/push/subscriptions/topic", {
    params: { endpoint, topic },
  });
};

export const fetchPushDiagnostics = async (
  endpoint: string | null,
): Promise<PushDiagnosticsResponse> => {
  const { data } = await apiClient.get<PushDiagnosticsResponse>("/push/diagnostics", {
    params: endpoint ? { endpoint } : {},
  });
  return data;
};

export const sendPushTest = async (endpoint: string): Promise<PushTestResponse> => {
  const { data } = await apiClient.post<PushTestResponse>("/push/test", null, {
    params: { endpoint },
  });
  return data;
};
