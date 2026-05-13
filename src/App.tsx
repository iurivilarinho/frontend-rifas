import { Toaster } from "sonner";

import { QueryProvider } from "./app/provider/QueryProvider";
import { AppRoutes } from "./app/routing/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineBanner } from "./components/pwa/OfflineBanner";
import { PwaInstallPrompt } from "./components/pwa/PwaInstallPrompt";
import { PwaUpdatePrompt } from "./components/pwa/PwaUpdatePrompt";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <Toaster position="top-right" richColors closeButton theme="system" />
          <OfflineBanner />
          <PwaUpdatePrompt />
          <PwaInstallPrompt />
          <div className="min-h-screen bg-background pt-0 pb-16 text-foreground sm:pt-16 sm:pb-0">
            <AppRoutes />
          </div>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
