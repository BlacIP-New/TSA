import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#E8001C]">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gray-950">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              The portal hit an unexpected error. Reload the page to recover gracefully.
            </p>
            <div className="mt-6 flex justify-center">
              <Button leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => window.location.reload()}>
                Reload portal
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
