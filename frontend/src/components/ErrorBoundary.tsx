import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SKYSHIELD Uncaught UI Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-[#ffeaea] rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-[#ff6161]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#212121]">SKYSHIELD UI Recovered</h2>
              <p className="text-xs text-[#878787] mt-1">
                A rendering anomaly was safely contained. You can reload the command center below.
              </p>
            </div>
            {this.state.error && (
              <div className="text-[11px] font-mono bg-[#f7f7f7] p-2 rounded text-left text-[#878787] overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="btn-primary w-full py-2.5 rounded text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Command Center
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
