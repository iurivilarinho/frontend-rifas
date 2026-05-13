import { useCallback, useEffect, useState } from "react";
import {
  fetchPushDiagnostics,
  getPushPublicKey,
  registerPushSubscription,
  removePushSubscriptionTopic,
} from "../api/services/pushApi";
import type { PushTopic } from "../api/dtos/push";

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }
  return output;
};

const arrayBufferToBase64Url = (buffer: ArrayBuffer | null): string => {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

interface UsePushSubscriptionOptions {
  topic: PushTopic;
  customerId?: number;
}

interface UsePushSubscriptionResult {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isWorking: boolean;
  enable: () => Promise<{ ok: boolean; reason?: string }>;
  disable: () => Promise<void>;
}

const ensureBrowserSubscription = async (): Promise<PushSubscription | null> => {
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  const publicKey = await getPushPublicKey();
  if (!publicKey) return null;
  const applicationServerKey = urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
};

const hasTopicForEndpoint = async (
  endpoint: string,
  topic: PushTopic,
): Promise<boolean> => {
  try {
    const data = await fetchPushDiagnostics(endpoint);
    return Boolean(data.currentDevice?.topics.some((entry) => entry.topic === topic));
  } catch {
    return false;
  }
};

export const usePushSubscription = ({
  topic,
  customerId,
}: UsePushSubscriptionOptions): UsePushSubscriptionResult => {
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    supported ? Notification.permission : "unsupported",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
          if (!cancelled) setIsSubscribed(false);
          return;
        }
        const has = await hasTopicForEndpoint(existing.endpoint, topic);
        if (!cancelled) setIsSubscribed(has);
      } catch {
        if (!cancelled) setIsSubscribed(false);
      }
    };

    void checkExisting();
    return () => {
      cancelled = true;
    };
  }, [supported, topic]);

  const enable = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    if (!supported) return { ok: false, reason: "unsupported" };
    setIsWorking(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return { ok: false, reason: "denied" };

      const subscription = await ensureBrowserSubscription();
      if (!subscription) return { ok: false, reason: "missing-server-key" };

      const p256dh = arrayBufferToBase64Url(subscription.getKey("p256dh"));
      const auth = arrayBufferToBase64Url(subscription.getKey("auth"));

      await registerPushSubscription({
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        topic,
        customerId,
      });

      setIsSubscribed(true);
      return { ok: true };
    } catch (error) {
      console.error("[push] enable failed", error);
      const message = error instanceof Error ? error.message : "unknown";
      return { ok: false, reason: `error: ${message}` };
    } finally {
      setIsWorking(false);
    }
  }, [supported, topic, customerId]);

  const disable = useCallback(async (): Promise<void> => {
    if (!supported) return;
    setIsWorking(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscriptionTopic(subscription.endpoint, topic).catch(
          () => undefined,
        );
      }
      setIsSubscribed(false);
    } finally {
      setIsWorking(false);
    }
  }, [supported, topic]);

  return { supported, permission, isSubscribed, isWorking, enable, disable };
};
