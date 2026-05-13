import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const runtimeApiBaseUrl = window.__APP_RUNTIME_CONFIG__?.RAFFLE_API_URL?.trim();

export const apiBaseUrl =
  runtimeApiBaseUrl ||
  import.meta.env.VITE_RAFFLE_API_URL ||
  "http://localhost:8089";

let onSessionExpired = () => {};

export const setOnSessionExpired = (callback: () => void) => {
  onSessionExpired = callback;
};

interface RetriableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh") ?? false;

    if (status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      try {
        originalRequest._retry = true;
        await refreshClient.post("/auth/refresh");
        return apiClient(originalRequest);
      } catch (refreshError) {
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
