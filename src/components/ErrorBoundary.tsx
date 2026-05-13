import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-4 bg-green-50 px-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Algo deu errado</h1>
          <p className="max-w-md text-sm text-gray-600">
            Encontramos um erro inesperado. Recarregue a página para tentar
            novamente.
          </p>
          {this.state.error?.message && (
            <code className="max-w-md rounded-md bg-white px-3 py-2 text-xs text-red-600 shadow-sm">
              {this.state.error.message}
            </code>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
