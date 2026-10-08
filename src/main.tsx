import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur capturée par RootErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-black/[0.08] text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-bold text-[#1d1d1f]">
              Une interruption inattendue est survenue
            </h1>
            <p className="text-xs text-[#86868b] leading-relaxed">
              L'application a rencontré une anomalie lors du chargement. Vos données stockées dans IndexedDB restent en sécurité.
            </p>
            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#fbfbfd] border border-black/[0.05] text-[11px] font-mono text-rose-600 text-left overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Recharger la page
              </button>
              <button
                onClick={this.handleHardReset}
                className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] text-[#555558] text-xs font-medium transition cursor-pointer"
              >
                Réinitialiser le cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
