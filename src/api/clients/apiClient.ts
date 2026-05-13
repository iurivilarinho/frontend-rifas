import axios, { type AxiosError } from "axios";

const runtimeApiBaseUrl = window.__APP_RUNTIME_CONFIG__?.RAFFLE_API_URL?.trim();

export const apiBaseUrl =
  runtimeApiBaseUrl ||
  import.meta.env.VITE_RAFFLE_API_URL ||
  "http://localhost:8089";

let onSessionExpired = () => {};

export const setOnSessionExpired = (callback: () => void) => {
  onSessionExpired = callback;
};

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const wasLoggedBefore = () => {
  try {
    return Boolean(localStorage.getItem("user"));
  } catch {
    return false;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && wasLoggedBefore()) {
      try {
        localStorage.removeItem("user");
      } catch {
        // ignore
      }
      onSessionExpired();
    }
    return Promise.reject(error);
  },
);
