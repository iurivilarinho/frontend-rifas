/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_RAFFLE_API_URL?: string;
  readonly VITE_VIA_CEP_API_URL?: string;
  readonly VITE_IBGE_LOCATIONS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __APP_RUNTIME_CONFIG__?: {
    RAFFLE_API_URL?: string;
  };
}
