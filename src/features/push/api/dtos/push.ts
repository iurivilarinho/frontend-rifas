export type PushTopic = "raffle-buyer" | "raffle-admin";

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
  topic: PushTopic;
  customerId?: number;
}

export interface PushPublicKeyResponse {
  publicKey: string | null;
}

export interface PushSubscriptionTopicEntry {
  id: number;
  topic: PushTopic;
  customerId: number | null;
}

export interface PushDiagnosticsResponse {
  vapidConfigured: boolean;
  vapidSubject: string | null;
  vapidPublicKeyPrefix: string | null;
  subscriptionsByTopic: Partial<Record<PushTopic, number>>;
  currentDevice: {
    endpointHost: string | null;
    topics: PushSubscriptionTopicEntry[];
  } | null;
}

export interface PushTestResponse {
  attempted: boolean;
  statusCode: number | null;
  errorMessage: string | null;
  subscriptionId: number | null;
  topic: PushTopic | null;
}
